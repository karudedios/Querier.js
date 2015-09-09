export default (() => {
  "use strict";

  //////////////////////
  // Array Extensions //
  //////////////////////
  
  Array.prototype.select = function(func) {
    return this.length > 0
      ? [func(this[0])].concat(this.slice(1).select(func))
      : [];
  };

  Array.prototype.selectMany = function(func) {
    return this.length > 0
      ? [].concat.apply([], [func(this[0])].concat(this.slice(1).select(func)))
      : [];
  };

  Array.prototype.where = function(predicate) {
    return this.length > 0
      ? predicate(this[0]) && [this[0]].concat(this.slice(1).where(predicate)) || this.slice(1).where(predicate)
      : [];
  };

  let Querier = (() => {
    class QueryableObject {
      constructor({name, queryableEntity, where}) {
        Object.assign(this, { name, queryableEntity, where });
      }

      match({ queryableObjectPath, constraintObjectPath }) {
        return this.where
          ? constraintObjectPath(this.queryableEntity, this.where)
          : queryableObjectPath(this.queryableEntity);
      }
    }

    class Querier {
      constructor(queryableObjects) {
        Object.defineProperty(this, 'queryableObjects', { value: queryableObjects });
      }

      append({ as, from, where }){
        let queryableObject = new QueryableObject({
          //TODO: Make 'as' actually serve a purpose.
          name: as,
          queryableEntity: from,
          where: where
        });

        let constructor = from.constructor;

        if (!this.queryableObjects.map(x => x.queryableEntity).every(object => object instanceof constructor)) {
          throw "Only objects of the same instance can be enumerated in a single query";
        }
        else if (this.queryableObjects.length > 0 && this.queryableObjects.some(qo => qo.queryableEntity.selectMany === undefined)) {
          throw "Some of the selected objects doesn't posses a 'selectMany' so multiple objects cannot be enumerated";
        }
        else if (!from.select) {
          throw "The selected Object doesn't posses a 'select' clause to use";
        }
        else if (where && !from.where) {
         throw "The selected Object doesn't posses a 'where' clause to use";
        }

        return new Query(this.queryableObjects.concat([queryableObject]));
      }
    }

    class EmptyQuery extends Querier {
      constructor() {
        super([]);
      }
    }

    class Query extends Querier {
      constructor(queryableObjects) {
        super(queryableObjects);
      }

      select(func) {
        let bind = function(item, instruction, target) {
          return (...args) => item[instruction](target.bind(item, ...args));
        };

        return this.queryableObjects.reduceRight((func, item, idx, orig) => {
          let entity = item.match({
            queryableObjectPath: (entity) => entity,
            constraintObjectPath: (entity, where) => entity.where(where)
          });
          
          return bind(entity, (idx + 1 === orig.length) ? 'select' : 'selectMany', func);
        }, func)();
      }
    }

    return new EmptyQuery();
  })();

  return { Querier };

})();