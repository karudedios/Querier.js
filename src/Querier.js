export default (() => {
  "use strict";

  let Querier = (() => {
    String.prototype.format = function(...args) {
      return this.replace(/\{(\d)\}/g, (_, $1) => args[+$1]);
    };

    let getArgs = (f) => f.toString().match(/\((.*)\)\W?{/)[1].replace(/ /g, '');
    let getBody = (value, idx) => value.where ? `.where($q[${idx}].where)` : '';
    let getFormat = (body, action, k, idx) => `$q[${idx}].queryableEntity${body}.${action}(function(${k.name}) { return {0}; })`;

    class QueryableObject {
      constructor({name, queryableEntity, where}) {
        Object.assign(this, { name, queryableEntity, where });
      }
    }

    class Querier {
      constructor(queryableObjects) {
        Object.defineProperty(this, 'queryableObjects', { value: queryableObjects });
      }

      pipe({ as, from, where }){
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
        
        if ($q.length === 0) return;
        
        let getAction = (orig, i) => orig.length === (i + 1) ? 'select' : 'selectMany';
        let resolveReduce = (str, value, i, orig) => str.format(getFormat(getBody(value, i), getAction(orig, i), value, i));

        let ac = $q.reduce(resolveReduce, '{0};').format(`func(${ getArgs(func) })`);
        return eval(ac);
      }
    }

    return { build(init) { return new EmptyQuery() } };
  })();

  return { Querier };

})();