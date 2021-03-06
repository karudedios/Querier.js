[![Build Status](https://travis-ci.org/karudedios/Querier.js.svg?branch=master)](https://travis-ci.org/karudedios/Querier.js)
[![npm version](https://badge.fury.io/js/querier.js.svg)](http://badge.fury.io/js/querier.js)
[![devDependency Status](https://david-dm.org/karudedios/querier.js/dev-status.svg)](https://david-dm.org/karudedios/querier.js#info=devDependencies)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/karudedios/Querier.js/master/LICENSE)

#Querier.js

The concept for this project was based off of C# Linq Query Syntax.

##Description

The objective of Querier.js is to simplify some of the work when dealing with multiple 'enumerable' objects.

##Usage

To use the Querier, depending what you're trying to do, you require to have certain methods.

*Examples will be shown on both C#'s Linq and Javascript*

*By including Querier.js you automatically get `.select`, `.selectMany` and `.where` on `Array.prototype`*

1. **select**: In order to use a single `{ as, from }` clause, the Object you're trying to enumerate should have a 'select' method.

  ```C#
    var collection = Enumerable.Range(1, 3).ToList();
    ...
    from a in collection
    select a + 3
  ```

  ```Javascript
    let collection = [1, 2, 3];
    ...
    Querier
      .append({ as: 'a', from: collection })
      .select(({a}) => a + 3);
  ```

2. **selectMany**: In order to use several `{ as, from }` clauses, the Object you're trying to enumerate should have a 'selectMany' method.

  ```C#
    var collection = Enumerable.Range(1, 3).ToList();
    ...
    from a in collection
    from b in collection
    from c in collection
    select a + b + c
  ```

  ```Javascript
    let collection = [1, 2, 3];
    ...
    Querier
      .append({ as: 'a', from: collection })
      .append({ as: 'b', from: collection })
      .append({ as: 'c', from: collection })
      .select(({a, b, c}) => a + b + c);
  ```

3. **where**: In order to use one or more `{ as, from, where}` clause, the Object you're trying to enumerate should have a 'where' method.

  ```C#
    var collection = Enumerable.Range(1, 3).ToList();
    ...
    from a in collection
    where a % 2 == 0

    from b in collection
    where b % 2 != 0

    from c in collection
    select a + b + c
  ```

  ```Javascript
    let collection = [1, 2, 3];
    ...
    Querier
      .append({ as: 'a', from: collection, where: (a) => a % 2 === 0 })
      .append({ as: 'b', from: collection, where: (b) => b % 2 !== 0 })
      .append({ as: 'c', from: collection })
      .select(({a, b, c}) => a + b + c);
  ```

**To Note:** Even though I always used the parameters in the order I appended them, you can have them in any order you'd like. Say, instead of `select({a, b, c})` you could have `select({c, b, a})` and it would work the same, I had them in order because I like it organized that way.