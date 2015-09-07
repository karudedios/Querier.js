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
        let $q = this.queryableObjects;

        let bind = function(item, instruction, target) {
          return (...args) => item[instruction](target.bind(item, ...args));
        };

        return $q.reduceRight((func, item, idx, orig) => {
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