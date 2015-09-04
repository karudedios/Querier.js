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

    class Querier {
      constructor(dictionary) {
        this.dictionary = dictionary || {};
      }

      pipeMany(...pipes){
        return pipes.reduce((query, pipe) => query.pipe(pipe), this);
      }

      pipe({ as, from, where }){
        let id = Object.keys(this.dictionary).filter((k) => k.indexOf('_') > -1).length;
        let _from = `_${id + 1}`;

        return new Querier(this.dictionary.put(as, from).putWhen(where !== undefined, _from, where));
      }

      from(name){
        return {
          in: (selectable) => {
            return new Querier(this.dictionary.put(name, selectable));
          }
        };
      }

      select(cb){
        let $q = this.dictionary;
        let keys = Object.keys($q);

        let leftCompose = (f1, f2) => (...args) => console.log(f1, f2, args) || f1(f2(...args));
        
        if (keys.length === 0) return;

        let fn = keys.reduceRight((composed, key) => leftCompose(() => $q[key].selectMany, composed), () => $q[keys.pop()].select);
        console.log(fn(cb));

        let getAction = (orig, i) => orig.length === (i + 1) ? 'select' : 'selectMany';
        let resolveReduce = (str, k, i, orig) => str.format(getFormat(getBody($q[k]), getAction(orig, i), k));

        let ac = keys.reduce(resolveReduce, '{0};').format(`cb(${ getArgs(cb) })`);

        //return eval(ac);
      }
    }

    return { new(init) { return new Querier(init || {}) } };
  })();

  return { Querier };

})();