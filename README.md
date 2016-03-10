# agna-disc
Version 0.0.2, basic concept edition, there is A LOT to be done.

## Description
agna-disc (DISC) is a dependency injection (DI) service container written in javascript.
The idea came from the dependency injection container of Spring framework (Java).
You can read more about inversion of control and dependency injection containers here:
http://www.martinfowler.com/articles/injection.html

## Usage
### Creating a DISC instance
There are two ways to create a DISC instance.

```js
  var _disc = require('agna-disc')(<configuration>);
```

```js
  var _Disc = require('agna-disc');
  var disc = new _Disc(<configuration>);
```

#### <configuration>
Required: true
Type: Object
Plain javascript object with configuration parameters.

What is a plain javascript object?
```js
var plainObject = {};
var plainObject = new Object();
var plainObject = Object();
```
Any of the above.

## Configuration structure
The configuration structure describes the various components and their relations with each other within the DISC.
The configuration itself is a plain javascript object with key and value pairs.

```js
var configuration = {
  allowOverwrite: false,
  locator: <function>|<object>,
  <component name>: <component config>,
  <component name>: <component config>,
  ...
};
```

### <component name>
Required: true
Type: string
The name of the component. It is used to designate a dependency or to get a component instance from the DISC.
It is a unique identifier.

### <component config>
Required: true
Type: Object
Component configuration object.

## Reserved keys & values
There are a few reserved keys in the configuration.

### allowOverwrite
Required: false
Value: Boolean
Default: false
If set to true overwriting existing component definitions is allowed.

### locator
Require: false
Value: Object
Default: require
Used by DISC to find and load component modules. It needs to be an object with a "__locate(path)" function. 

### parent
Require: false
Value: DISC instance
The parent container. 

## Lifecycle
There are three lifecycle states a component can have, however, not all are applicable to every component type.

### Registered
A component enters the registered state when it's configuration is set.  

### Instantiated
A component enters the instantiated state when it's constructor has been called and the instance is stored.

### Initialized
A component enters the initialized state, when it's setters have been called and the instance is ready for use.

### How does the lifecycle work?
When you create a container providing a configuration object, all components in the configuration get registered.
Components flagged for eager loading first get instantiated (all dependencies resolved and injected), then initialized.
Same happens to their dependencies. This way entire dependency chains can get initialized.
After initializing these components the DISC fires the INITALIZED event calling all listeners.
When the listeners are done running, DISC is ready to use. You can get or set components.

## Components
There are four component types.
- Value
- Service
- Factory
- Scope

### Value
Defines a simple value component inside DISC.
Value components are like variables in javascript.

#### Configuration object
```js
var configuration = {
  <component name>: {
    type: 'value',
    value: <value>
    OR
    callback: <function>
  }
};
```

You need to decide if you or a callback function will present the value.
If the later is chosen, then the result of the function call will be stored as the value.

##### type
Required: true
Value: 'value'
Defines value component type.

##### value
Required: false
Value: Anything
Defines component value.

##### callback
Required: false
Value: Function
Defines a callback function which will provide the component value. The callback function receives the container as a parameter. 

#### Lifecycle states
The value type has two lifecycle state, registered and initialized.

#### Examples
```js
var configuration = {
  simple: {
    type: 'value',
    value: 'ample sample'
  }
};

var disc = require('agna-disc')(configuration);
var simple = disc.get('simple');
console.log(simple);
```
This will result in a console entry:'ample sample'

```js
var configuration = {
  simple: {
    type: 'value',
    callback: function (container) {
      return 'sounds perfect!';
    }
  }
};

var disc = require('agna-disc')(configuration);
var simple = disc.get('simple');
console.log(simple);
```
This will result in a console entry:'sounds perfect!'

### Service
Defines a service component inside DISC.
Every service is instantiated and initialized only once and the same instance is returned when requested.

#### Configuration object
```js
var configuration = {
  <component name>: {
    type: 'service',
    module: <name>|<instance>
    constructorArguments: <value>|[<value>, <value>], (not working for instance)
    setter: {
      [<property name>]|[<function name>]: <value>|<function with prop callback === true>
    },
    eagerLoad: true|false,
    once: {
      <event>: <functionName>|{method: functionName, arguments: <arg>|[<arg1>, <arg2>]}|[<functionName>|{method: functionName, arguments: <arg>|[<arg1>, <arg2>],...]
    }
  }
};
```

##### type
Required: true
Value: 'service'
Defines service component type.

##### module
Required: true
Value: String|Object
Value could be the name of a module constructor, a reference to a constructor function or a module instance.

##### constructorArguments
Required: false
Value: Mixed|Array of mixed values
Arguments to be passed to the constructor function.

##### setter
Required: false
Value: Object
Defines setter method/property key/values pairs.

###### key
A key can be surrounded with brackets '[',']' in this case the value pair must be an array of values.
It'll tell the DISC to execute the same setter multiple times on every array value.
A key can point to a sub module property or a sub module setter function. 

###### value
A value could be any valid javascript type or a function having a callback = true property.
When the value is a function with having a callback = true property, it'll tell DISC to first
execute the function and use it's return value as a parameter for the setter.

##### eagerLoad
Required: false
Value: Boolean
Eager loads the component creating the component instance.

##### once
Required: false
Value: Object
On Container Event, a container even handler descriptor object with key/value pairs.

###### key
The key is the event name to handle.

###### value
The value defines the handler (single value) or handlers (array of values).
The value could be:
- A string reference to a function.
- An object providing a reference to a function and the function arguments.

#### Lifecycle states
The service type has all three lifecycle states.

#### Examples
```js
{
  type: 'service',
  module: 'koa'
}
```
Is equivalent with: 
```js
var koa = require('koa');
return new koa();
```

```js
{
  type: 'service',
  module: '{!http.Agent}'
  constructorArguments: 10
}
```
Is equivalent with:
```js
var http = require('http');
return new http.Agent(10);
```

```js
{
  type: 'service',
  module: '{!crypto.createCipher}'
  constructorArguments: ['aes192', 'a password']
}
```
Is equivalent with:
```js
var crypto = require('crypto');
return new crypto.createCipher('aes192', 'a password');
```

```js
{
  type: 'service',
  module: 'koa'
  setter: {
    [use]: [function (next) {
      ...
    }, ...]
  }
}
```
Is equivalent with:
```js
var koa = require('koa')();
koa.use(function (next) {
...
});
koa.use(...);
```

```js
{
  type: 'service',
  module: 'koa'
  once: {
    'discContainerInitialized': {
      method: 'listen',
      arguments: [3000]
    }
  }
}
```
It'll tell DISC to run
```js 
koa.listen(3000);
``` 
when it's done with the initialization.

### Factory
Defines a factory component in DISC.
Every time the service is requested from DISC, it'll use the configuration to create an object instance defined by the configuration parameters.

#### Configuration object
```js
var configuration = {
  <component name>: {
    type: 'factory',
    module: <name>,
    arguments: []
  }
};
```

##### type
Required: true
Value: 'factory'
Defines factory component type. 

##### module
Required: true
Value: String|Function
Value could be the name of a module function, a reference to a module's function or a function instance.

##### arguments
Required: false
Value: Mixed|Array of mixed values
Arguments to be passed to the factory function.

#### Lifecycle states
The factory type has two lifecycle state, registered and initialized.

#### Examples
```js
{
  type: 'factory',
  module: '{!crypto.createCipher}'
  arguments: ['aes192', 'a password']
}
```
Is equivalent with:
```js
var crypto = require('crypto');
return new crypto.createCipher('aes192', 'a password');
```

## References
Besides the basic building blocks another important part of DISC is references.
References are strings and help you with the configuration and with specifying dependencies.

### Reference types
There four types of references.

#### Simple reference
A simple reference does nothing more than refer to a component inside DISC.
Usage:
```js
{
  <key>: '{@<component name>}'
}
```

##### Example
```js
{
  type: 'service',
  module: 'koa'
  once: {
    'discContainerInitialized': {
      method: 'listen',
      arguments: [{@Port}]
    }
  }
}
```
It'll tell DISC to run the following code when it's done with the initialization.
```js
koa.listen(DISC.get('Port'));
``` 

#### Binding reference
Binding reference is applicable to functions. DISC binds the parent component to "this" keyword inside the function.
Usage:
```js
{
  <key>: '{*<component name>.<function name>}'
}
```

##### Example
```js
{
  type: 'service',
  module: 'koa'
  once: {
    'discContainerInitialized': {
      method: 'listen',
      arguments: [{@Port}, {*Logger.log}]
    }
  }
}
```
It'll tell DISC to run the following code when it's done with the initialization.
```js
var logger = DISC.get('Logger');
koa.listen(DISC.get('Port'), logger.log.bind(logger));
``` 

#### Callback reference
Callback reference is applicable to functions. The container will call the referenced function and use the return value for injection. 
Also, if the function is a property of a component, DISC binds the parent component to "this" keyword inside the function.
Usage:
```js
{
  <key>: '{^<component name>.<function name>}'
}
```

##### Example
```js
{
  type: 'service',
  module: 'koa'
  setters: {
    use: '{^Statmaker.getMiddleware}'
  }
}
```
Is equivalent with:
```js
var statmaker = DISC.get('Statmaker');
koa.use(statmaker.getMiddleware());
```

#### Locator reference
Locator reference tells the module locator to load a specific module, return with it, it's property or sub-property.
Module name could include a path surrounded by parenthesis.

Usage:
```js
{
  <key>: '{!<module name>.<property>}'
}
```

##### Examples
```js
{
  module: '{!winston.transports.Console}'
}
```
Is equivalent with:
```js
var winston = require('winston');
return winston.transports.Console);
```

```js
{
  module: '{!(./mylibrary/MyWinston.test.js).transports.Console}'
}
```
Is equivalent with:
```js
var winston = require('./mylibrary/MyWinston.test.js');
return winston.transports.Console);
```

##Tools
Check out the jasmine tests for live examples!

## Todos, Refactoring, Features
- API documentation.
- Finishing all jasmine test.
- Make it more minifying friendly (X.prototype.function = ... vs var prototype = X.prototype; prototype.function = ...).
- Isomoprhic testing.
- Automatic building.
- Inline configuration besides configuration files.
- More appropriate naming (item?).
- Compiling, web package.
- Better error checking.
- Using _.get, where appropriate.
- Better events, simple event handling vs rubberduck.js?.
- Performance testing (CPU, Memory).
- How about ES6ifying? (consider isomorphic problems like babel "bloating", beacuse size does mater, speed does mater).

## Licensing
agna-disc is free software.
It comes without any warranty, to the extent permitted by applicable law.
You can redistribute it and/or modify it under the terms of the 
Do What The Fuck You Want To Public License, Version 2, as published by Sam Hocevar.
See http://www.wtfpl.net/ for more details.