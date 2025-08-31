#!/bin/bash

# TaskMaster Test Integration Script
# This script integrates automatic test execution with TaskMaster workflow

CONFIG_FILE=".taskmaster/test-config.json"
TASKMASTER_TASKS_FILE=".taskmaster/tasks/tasks.json"
TEST_RESULTS_DIR=".taskmaster/test-results"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if configuration exists
check_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        log_error "Test configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    if [ ! -f "$TASKMASTER_TASKS_FILE" ]; then
        log_error "TaskMaster tasks file not found: $TASKMASTER_TASKS_FILE"
        exit 1
    fi
}

# Function to read JSON configuration
get_config_value() {
    local key=$1
    jq -r "$key" "$CONFIG_FILE" 2>/dev/null
}

# Function to check if auto-testing is enabled
is_auto_testing_enabled() {
    local enabled=$(get_config_value ".autoTestConfig.enabled")
    [ "$enabled" = "true" ]
}

# Function to count completed tasks
count_completed_tasks() {
    jq -r '.tasks[] | select(.status == "done") | .id' "$TASKMASTER_TASKS_FILE" 2>/dev/null | wc -l
}

# Function to check if major tasks are completed
check_major_tasks_completed() {
    local min_tasks=$(get_config_value ".autoTestConfig.triggerConditions.taskCompletion.minTasksCompleted")
    local completed_count=$(count_completed_tasks)
    
    if [ "$completed_count" -ge "$min_tasks" ]; then
        log "Major tasks completed: $completed_count >= $min_tasks"
        return 0
    else
        log "Not enough tasks completed: $completed_count < $min_tasks"
        return 1
    fi
}

# Function to check if manual trigger keywords are present
check_manual_trigger() {
    local message="$1"
    local keywords=$(get_config_value ".autoTestConfig.triggerConditions.manualTrigger.keywords[]")
    
    for keyword in $keywords; do
        if echo "$message" | grep -qi "$keyword"; then
            log "Manual trigger detected: '$keyword' found in message"
            return 0
        fi
    done
    
    return 1
}

# Function to run test suite
run_test_suite() {
    local suite_name=$1
    local command_key=".autoTestConfig.testSuites.$suite_name.command"
    local fallback_key=".autoTestConfig.testSuites.$suite_name.fallbackCommand"
    
    local command=$(get_config_value "$command_key")
    local fallback_command=$(get_config_value "$fallback_key")
    
    log "Running $suite_name tests..."
    
    # Try primary command
    if [ -n "$command" ]; then
        log "Executing: $command"
        if eval "$command"; then
            log_success "$suite_name tests passed"
            return 0
        else
            log_warning "$suite_name tests failed with primary command"
        fi
    fi
    
    # Try fallback command
    if [ -n "$fallback_command" ]; then
        log "Trying fallback command: $fallback_command"
        if eval "$fallback_command"; then
            log_success "$suite_name tests passed (fallback)"
            return 0
        else
            log_error "$suite_name tests failed with fallback command"
        fi
    fi
    
    return 1
}

# Function to run all required tests
run_all_tests() {
    log "🚀 Starting automatic test execution..."
    
    # Create results directory
    mkdir -p "$TEST_RESULTS_DIR"
    
    local overall_success=true
    local results=()
    
    # Get enabled test suites
    local test_suites=$(get_config_value ".autoTestConfig.testSuites | to_entries[] | select(.value.enabled == true) | .key")
    
    for suite in $test_suites; do
        local start_time=$(date +%s)
        
        if run_test_suite "$suite"; then
            results+=("$suite:SUCCESS")
        else
            results+=("$suite:FAILED")
            overall_success=false
        fi
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log "Test suite '$suite' completed in ${duration}s"
    done
    
    # Save results
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local results_file="$TEST_RESULTS_DIR/test-results_$timestamp.json"
    
    cat > "$results_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "overall_success": $overall_success,
  "results": [
EOF
    
    for result in "${results[@]}"; do
        local suite=$(echo "$result" | cut -d: -f1)
        local status=$(echo "$result" | cut -d: -f2)
        echo "    {\"suite\": \"$suite\", \"status\": \"$status\"}," >> "$results_file"
    done
    
    cat >> "$results_file" << EOF
  ],
  "config_used": "$CONFIG_FILE"
}
EOF
    
    if [ "$overall_success" = true ]; then
        log_success "All tests completed successfully!"
        echo "📊 Results saved to: $results_file"
        return 0
    else
        log_error "Some tests failed!"
        echo "📊 Results saved to: $results_file"
        return 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --force          Force test execution regardless of conditions"
    echo "  --check-only     Only check if tests should run, don't execute"
    echo "  --message TEXT   Check manual trigger with specific message"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Check conditions and run tests if needed"
    echo "  $0 --force            # Force test execution"
    echo "  $0 --check-only       # Only check conditions"
    echo "  $0 --message 'test'   # Check manual trigger"
}

# Main execution
main() {
    local force=false
    local check_only=false
    local message=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force=true
                shift
                ;;
            --check-only)
                check_only=true
                shift
                ;;
            --message)
                message="$2"
                shift 2
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Check configuration
    check_config
    
    # Check if auto-testing is enabled
    if ! is_auto_testing_enabled; then
        log_warning "Auto-testing is disabled in configuration"
        exit 0
    fi
    
    # Determine if tests should run
    local should_run=false
    
    if [ "$force" = true ]; then
        should_run=true
        log "Force execution requested"
    elif [ -n "$message" ] && check_manual_trigger "$message"; then
        should_run=true
        log "Manual trigger detected"
    elif check_major_tasks_completed; then
        should_run=true
        log "Major tasks completion trigger detected"
    else
        log "No trigger conditions met"
    fi
    
    if [ "$check_only" = true ]; then
        if [ "$should_run" = true ]; then
            log_success "Tests should run"
            exit 0
        else
            log_warning "Tests should not run"
            exit 1
        fi
    fi
    
    # Run tests if conditions are met
    if [ "$should_run" = true ]; then
        run_all_tests
        exit $?
    else
        log "No tests executed - conditions not met"
        exit 0
    fi
}

# Run main function
main "$@"
