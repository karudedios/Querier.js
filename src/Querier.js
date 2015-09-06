export default (() => {
  "use strict";

  let Querier = (() => {
    Object.prototype.put = function(key, value) {
      this[key] = value;
      return this;
    };

    Object.prototype.putWhen = function(predicate, key, value) {
      return predicate
        ? this.put(key, value)
        : this;
    };

    String.prototype.format = function(...args) {
      return this.replace(/\{(\d)\}/g, (_, $1) => args[+$1]);
    };

    let getArgs = (f) => f.toString().match(/\((.*)\)\W?{/)[1].replace(/ /g, '');
    let getBody = (value) => value instanceof Function ? `(${getArgs(value)})` : '';
    let getFormat = (body, action, k) => `$q['${k}']${body}.${action}(function(${k}) { return {0}; })`;

    class QueryableObject {
      constructor(name, enumerable, where) {
        Object.assign(this, { name, enumerable, where });
      }
    }

    class Querier {
      constructor(dictionary) {
        Object.defineProperty(this, 'dictionary', { value: dictionary });
      }

      pipeMany(...pipes) {
        return pipes.reduce((query, pipe) => query.pipe(pipe), this);
      }

      pipe({ as, from, where }){
        let id = Object.keys(this.dictionary).filter((k) => k.indexOf('_') > -1).length;
        let _from = `_${id + 1}`;
        let f = (_) => from.where(_);

        return new Query(this.dictionary.put(as, from).putWhen(where !== undefined, _from, where));
      }

      from(name) {
        return {
          in: (selectable) => {
            return new Query(this.dictionary.put(name, selectable));
          }
        };
      }
    }

    class EmptyQuery extends Querier {
      constructor() {
        super({});
      }
    }

    class Query extends Querier {
      constructor(dictionary) {
        super(dictionary);
      }

      where(predicate) {
        let id = Object.keys(this.dictionary).filter((k) => k.indexOf('_') > -1).length;
        let _from = `_${id + 1}`;

        return new Querier(this.dictionary.put(_from, predicate));
      }

      select(cb) {
        let $q = this.dictionary;
        let keys = Object.keys($q);
        
        if (keys.length === 0) return;
        
        let getAction = (orig, i) => orig.length === (i + 1) ? 'select' : 'selectMany';
        let resolveReduce = (str, k, i, orig) => str.format(getFormat(getBody($q[k]), getAction(orig, i), k));

        let ac = keys.reduce(resolveReduce, '{0};').format(`cb(${ getArgs(cb) })`);
        console.log(ac)
        return eval(ac);
      }
    }

    return { build(init) { return new EmptyQuery() } };
  })();

  return { Querier };

})();