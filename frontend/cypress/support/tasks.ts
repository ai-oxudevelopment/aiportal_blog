// cypress/support/tasks.ts
// Custom Cypress tasks for Task 1 verification

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as net from 'net';

const execAsync = promisify(exec);

// File system tasks
export const fileSystemTasks = {
  // Read directory contents
  readdir: async (dirPath: string): Promise<string[]> => {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      console.error(`Error reading directory ${dirPath}:`, error);
      return [];
    }
  },

  // Read file contents
  readFile: async (filePath: string): Promise<string> => {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return '';
    }
  },

  // Check if file exists
  fileExists: async (filePath: string): Promise<boolean> => {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`Error checking file existence ${filePath}:`, error);
      return false;
    }
  },

  // Check if directory exists
  dirExists: async (dirPath: string): Promise<boolean> => {
    try {
      return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
    } catch (error) {
      console.error(`Error checking directory existence ${dirPath}:`, error);
      return false;
    }
  }
};

// Port checking task
export const portTasks = {
  // Check if port is available
  checkPort: async (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.once('close', () => {
          resolve(true);
        });
        server.close();
      });
      
      server.on('error', () => {
        resolve(false);
      });
    });
  }
};

// Application management tasks
export const appTasks = {
  // Start frontend application
  startFrontend: async (): Promise<void> => {
    try {
      const frontendPath = path.join(process.cwd(), 'frontend');
      
      // Check if frontend directory exists
      if (!fs.existsSync(frontendPath)) {
        throw new Error('Frontend directory does not exist');
      }

      // Start frontend in background
      const { stdout, stderr } = await execAsync('npm run dev', {
        cwd: frontendPath,
        windowsHide: true
      });

      console.log('Frontend started:', stdout);
      if (stderr) {
        console.error('Frontend stderr:', stderr);
      }
    } catch (error) {
      console.error('Error starting frontend:', error);
      throw error;
    }
  },

  // Stop frontend application
  stopFrontend: async (): Promise<void> => {
    try {
      // Kill processes on port 3000
      const { stdout, stderr } = await execAsync(
        process.platform === 'win32' 
          ? 'netstat -ano | findstr :3000 | findstr LISTENING'
          : 'lsof -ti:3000'
      );

      if (stdout.trim()) {
        const pids = stdout.trim().split('\n').map(line => {
          if (process.platform === 'win32') {
            return line.split(/\s+/).pop();
          } else {
            return line.trim();
          }
        }).filter(Boolean);

        for (const pid of pids) {
          await execAsync(
            process.platform === 'win32' 
              ? `taskkill /PID ${pid} /F`
              : `kill -9 ${pid}`
          );
        }
      }

      console.log('Frontend stopped');
    } catch (error) {
      console.error('Error stopping frontend:', error);
    }
  },

  // Start backend application
  startBackend: async (): Promise<void> => {
    try {
      const backendPath = path.join(process.cwd(), 'backend');
      
      // Check if backend directory exists
      if (!fs.existsSync(backendPath)) {
        throw new Error('Backend directory does not exist');
      }

      // Start backend in background
      const { stdout, stderr } = await execAsync('npm run develop', {
        cwd: backendPath,
        windowsHide: true
      });

      console.log('Backend started:', stdout);
      if (stderr) {
        console.error('Backend stderr:', stderr);
      }
    } catch (error) {
      console.error('Error starting backend:', error);
      throw error;
    }
  },

  // Stop backend application
  stopBackend: async (): Promise<void> => {
    try {
      // Kill processes on port 1337
      const { stdout, stderr } = await execAsync(
        process.platform === 'win32' 
          ? 'netstat -ano | findstr :1337 | findstr LISTENING'
          : 'lsof -ti:1337'
      );

      if (stdout.trim()) {
        const pids = stdout.trim().split('\n').map(line => {
          if (process.platform === 'win32') {
            return line.split(/\s+/).pop();
          } else {
            return line.trim();
          }
        }).filter(Boolean);

        for (const pid of pids) {
          await execAsync(
            process.platform === 'win32' 
              ? `taskkill /PID ${pid} /F`
              : `kill -9 ${pid}`
          );
        }
      }

      console.log('Backend stopped');
    } catch (error) {
      console.error('Error stopping backend:', error);
    }
  }
};

// Export all tasks for Cypress configuration
export const tasks = {
  ...fileSystemTasks,
  ...portTasks,
  ...appTasks
};
