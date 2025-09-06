// frontend/src/lib/optimistic/OptimisticManager.ts
// Optimistic updates system for immediate UI feedback

interface OptimisticUpdate<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error' | 'rollback';
  retryCount: number;
  maxRetries: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData?: T) => void;
  onRollback?: (originalData: T) => void;
}

interface OptimisticConfig {
  maxRetries: number;
  retryDelay: number;
  autoRollback: boolean;
  rollbackDelay: number;
  enableMetrics: boolean;
}

interface OptimisticMetrics {
  totalUpdates: number;
  successfulUpdates: number;
  failedUpdates: number;
  rollbacks: number;
  retries: number;
}

class OptimisticManager {
  private updates = new Map<string, OptimisticUpdate>();
  private config: OptimisticConfig;
  private metrics: OptimisticMetrics;
  private retryTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(config: Partial<OptimisticConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 1000,
      autoRollback: true,
      rollbackDelay: 5000,
      enableMetrics: true,
      ...config,
    };

    this.metrics = {
      totalUpdates: 0,
      successfulUpdates: 0,
      failedUpdates: 0,
      rollbacks: 0,
      retries: 0,
    };
  }

  private generateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private scheduleRetry(update: OptimisticUpdate): void {
    if (update.retryCount >= update.maxRetries) {
      this.handleFailure(update);
      return;
    }

    const delay = this.config.retryDelay * Math.pow(2, update.retryCount);
    const timeout = setTimeout(() => {
      this.retryUpdate(update.id);
    }, delay);

    this.retryTimeouts.set(update.id, timeout);
  }

  private handleFailure(update: OptimisticUpdate): void {
    update.status = 'error';
    this.metrics.failedUpdates++;

    if (this.config.autoRollback && update.originalData) {
      this.rollback(update.id);
    }

    update.onError?.(new Error('Optimistic update failed'), update.originalData);
  }

  private rollback(updateId: string): void {
    const update = this.updates.get(updateId);
    if (!update || !update.originalData) return;

    update.status = 'rollback';
    this.metrics.rollbacks++;

    update.onRollback?.(update.originalData);
    
    // Remove from updates after rollback
    setTimeout(() => {
      this.updates.delete(updateId);
    }, this.config.rollbackDelay);
  }

  // Public API
  create<T>(
    data: T,
    options: {
      maxRetries?: number;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      onRollback?: (originalData: T) => void;
    } = {}
  ): string {
    const id = this.generateId();
    const update: OptimisticUpdate<T> = {
      id,
      type: 'create',
      data,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onRollback: options.onRollback,
    };

    this.updates.set(id, update);
    this.metrics.totalUpdates++;

    return id;
  }

  update<T>(
    id: string,
    data: T,
    originalData: T,
    options: {
      maxRetries?: number;
      onSuccess?: (data: T) => void;
      onError?: (error: Error, originalData: T) => void;
      onRollback?: (originalData: T) => void;
    } = {}
  ): string {
    const updateId = this.generateId();
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'update',
      data,
      originalData,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      onSuccess: options.onSuccess,
      onError: options.onError,
      onRollback: options.onRollback,
    };

    this.updates.set(updateId, update);
    this.metrics.totalUpdates++;

    return updateId;
  }

  delete<T>(
    id: string,
    originalData: T,
    options: {
      maxRetries?: number;
      onSuccess?: () => void;
      onError?: (error: Error, originalData: T) => void;
      onRollback?: (originalData: T) => void;
    } = {}
  ): string {
    const updateId = this.generateId();
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'delete',
      data: null as any,
      originalData,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
      maxRetries: options.maxRetries || this.config.maxRetries,
      onSuccess: options.onSuccess as any,
      onError: options.onError,
      onRollback: options.onRollback,
    };

    this.updates.set(updateId, update);
    this.metrics.totalUpdates++;

    return updateId;
  }

  async execute<T>(
    updateId: string,
    executeFunction: (data: T) => Promise<T>
  ): Promise<T | null> {
    const update = this.updates.get(updateId);
    if (!update) return null;

    try {
      const result = await executeFunction(update.data);
      
      update.status = 'success';
      this.metrics.successfulUpdates++;
      
      update.onSuccess?.(result);
      
      // Clean up successful update
      setTimeout(() => {
        this.updates.delete(updateId);
      }, 1000);

      return result;
    } catch (error) {
      update.retryCount++;
      this.metrics.retries++;
      
      if (update.retryCount >= update.maxRetries) {
        this.handleFailure(update);
      } else {
        this.scheduleRetry(update);
      }
      
      return null;
    }
  }

  async retryUpdate(updateId: string): Promise<void> {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Clear existing timeout
    const timeout = this.retryTimeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(updateId);
    }

    // This would typically be called with the actual execute function
    // For now, we'll just mark it as ready for retry
    update.status = 'pending';
  }

  confirm(updateId: string): void {
    const update = this.updates.get(updateId);
    if (!update) return;

    update.status = 'success';
    this.metrics.successfulUpdates++;
    
    update.onSuccess?.(update.data);
    
    // Clean up
    this.updates.delete(updateId);
  }

  cancel(updateId: string): void {
    const update = this.updates.get(updateId);
    if (!update) return;

    // Clear timeout if exists
    const timeout = this.retryTimeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(updateId);
    }

    // Rollback if we have original data
    if (update.originalData) {
      this.rollback(updateId);
    } else {
      this.updates.delete(updateId);
    }
  }

  getUpdate(updateId: string): OptimisticUpdate | null {
    return this.updates.get(updateId) || null;
  }

  getPendingUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter(
      update => update.status === 'pending'
    );
  }

  getFailedUpdates(): OptimisticUpdate[] {
    return Array.from(this.updates.values()).filter(
      update => update.status === 'error'
    );
  }

  clear(): void {
    // Clear all timeouts
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.retryTimeouts.clear();

    // Clear all updates
    this.updates.clear();
  }

  getMetrics(): OptimisticMetrics {
    return { ...this.metrics };
  }

  getStats(): {
    totalUpdates: number;
    pendingUpdates: number;
    failedUpdates: number;
    successRate: number;
    updates: Array<{
      id: string;
      type: string;
      status: string;
      age: number;
      retryCount: number;
    }>;
  } {
    const updates = Array.from(this.updates.values());
    const pendingUpdates = updates.filter(u => u.status === 'pending').length;
    const failedUpdates = updates.filter(u => u.status === 'error').length;
    const successRate = this.metrics.totalUpdates > 0 
      ? this.metrics.successfulUpdates / this.metrics.totalUpdates 
      : 0;

    return {
      totalUpdates: this.metrics.totalUpdates,
      pendingUpdates,
      failedUpdates,
      successRate,
      updates: updates.map(update => ({
        id: update.id,
        type: update.type,
        status: update.status,
        age: Date.now() - update.timestamp,
        retryCount: update.retryCount,
      })),
    };
  }

  // Cleanup on destroy
  destroy(): void {
    this.clear();
  }
}

// Singleton instance
export const optimisticManager = new OptimisticManager();

// Export types
export type { OptimisticUpdate, OptimisticConfig, OptimisticMetrics };
export { OptimisticManager };
