import { Injectable, Logger } from '@nestjs/common';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitStats {
  state: CircuitState;
  failures: number;
  lastFailureTime?: number;
  successesInHalfOpen: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private readonly circuits = new Map<string, CircuitStats>();

  private readonly failureThreshold = 5;
  private readonly resetTimeoutMs = 30000; // 30 seconds

  private getCircuit(key: string): CircuitStats {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: CircuitState.CLOSED,
        failures: 0,
        successesInHalfOpen: 0,
      });
    }
    return this.circuits.get(key)!;
  }

  canExecute(key: string): boolean {
    const circuit = this.getCircuit(key);

    if (circuit.state === CircuitState.OPEN) {
      const now = Date.now();
      if (
        circuit.lastFailureTime &&
        now - circuit.lastFailureTime > this.resetTimeoutMs
      ) {
        this.logger.log(
          `[CIRCUIT_BREAKER] Circuit ${key} transitioning from OPEN -> HALF_OPEN`,
        );
        circuit.state = CircuitState.HALF_OPEN;
        circuit.successesInHalfOpen = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(key: string): void {
    const circuit = this.getCircuit(key);
    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.successesInHalfOpen += 1;
      if (circuit.successesInHalfOpen >= 2) {
        this.logger.log(
          `[CIRCUIT_BREAKER] Circuit ${key} recovered. HALF_OPEN -> CLOSED`,
        );
        circuit.state = CircuitState.CLOSED;
        circuit.failures = 0;
      }
    } else {
      circuit.failures = 0;
    }
  }

  recordFailure(key: string): void {
    const circuit = this.getCircuit(key);
    circuit.failures += 1;
    circuit.lastFailureTime = Date.now();

    if (
      circuit.failures >= this.failureThreshold ||
      circuit.state === CircuitState.HALF_OPEN
    ) {
      this.logger.warn(
        `[CIRCUIT_BREAKER] Circuit ${key} OPENED due to ${circuit.failures} consecutive failures.`,
      );
      circuit.state = CircuitState.OPEN;
    }
  }

  getState(key: string): CircuitState {
    return this.getCircuit(key).state;
  }
}
