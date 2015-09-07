export default (() => {
  "use strict";

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
          name: as,
          queryableEntity: from,
          where: where
        });

        let constructor = from.constructor;

        if (!this.queryableObjects.map(x => x.queryableEntity).every(object => object instanceof constructor)) {
          throw "Only objects of the same instance can be enumerated in a single query";
        }

        if (this.queryableObjects.length > 0 && this.queryableObjects.some(qo => qo.queryableEntity.selectMany === undefined)) {
          throw "Some of the selected objects doesn't posses a 'selectMany' so multiple objects cannot be enumerated";
        }

        if (!from.select) {
          throw "The selected Object doesn't posses a 'select' clause to use";
        }

        if (where && !from.where) {
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