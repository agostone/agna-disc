'use strict';

/**
 * Component states module
 *
 * @module agna-disc/component/States
 */
var states = module.exports = {
  CREATED: 'discComponentCreated',
  INSTANTIATED: 'discComponentInstantiated',
  INITIALIZED: 'discComponentInitialized'
};

// Constantification
Object.defineProperty(states, 'CREATED', { configurable: false, writable: false });
Object.defineProperty(states, 'INSTANTIATED', { configurable: false, writable: false });
Object.defineProperty(states, 'INITIALIZED', { configurable: false, writable: false });
