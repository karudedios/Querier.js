"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var QueryableObject = function () {
  function QueryableObject(_ref) {
    var name = _ref.name;
    var queryableEntity = _ref.queryableEntity;
    var where = _ref.where;

    _classCallCheck(this, QueryableObject);

    console.log(name, queryableEntity, where);
    Object.assign(this, { name: name, queryableEntity: queryableEntity, where: where });
  }

  /**
   * Method to decide the path the object is going to take
   * Depending on it's content
   * @param   {[Function]}  options.queryableObjectPath   Path to take if the object has no where
   * @param   {[Function]}  options.constraintObjectPath  Path to take if the object has a where
   * @return  {[T]}                                       Result of the selected Path
   */


  _createClass(QueryableObject, [{
    key: "match",
    value: function match(_ref2) {
      var queryableObjectPath = _ref2.queryableObjectPath;
      var constraintObjectPath = _ref2.constraintObjectPath;

      return this.where.length > 0 ? constraintObjectPath(this.queryableEntity, this.where) : queryableObjectPath(this.queryableEntity);
    }
  }]);

  return QueryableObject;
}();

var Querier = function () {
  function Querier(queryableObjects) {
    _classCallCheck(this, Querier);

    Object.defineProperty(this, 'queryableObjects', { value: queryableObjects });
  }

  /**
   * Method to add more query constraints
   * @param   {[String]}    options.as      Alias for the object
   * @param   {[T]}         options.from    Queryable object
   * @param   {[Function]}  options.where   Constraint
   * @return  {[Query]}                     Query object
   */


  _createClass(Querier, [{
    key: "append",
    value: function append(_ref3) {
      var _this = this;

      var as = _ref3.as;
      var from = _ref3.from;
      var _ref3$where = _ref3.where;
      var where = _ref3$where === undefined ? [] : _ref3$where;


      if (!as) {
        throw "'as' should be a string representing the alias of the object you want to query";
      } else if (!from) {
        throw "'from' cannot be empty";
      } else {
        (function () {
          var constructor = from.constructor;

          if (!from.select) {
            throw "The selected Object doesn't posses a 'select' clause to use";
          } else if (!_this.queryableObjects.map(function (x) {
            return x.queryableEntity;
          }).every(function (object) {
            return object instanceof constructor;
          })) {
            throw "Only objects of the same instance can be enumerated in a single query";
          } else if (_this.queryableObjects.length > 0 && _this.queryableObjects.some(function (qo) {
            return qo.queryableEntity.selectMany === undefined;
          })) {
            throw "Some of the selected objects doesn't posses a 'selectMany' so multiple objects cannot be enumerated";
          } else if (where.length > 0 && !from.where) {
            throw "The selected Object doesn't posses a 'where' clause to use";
          }
        })();
      }

      var queryableObject = new QueryableObject({
        name: as,
        queryableEntity: from,
        where: where
      });

      return new Query(this.queryableObjects.concat([queryableObject]));
    }
  }]);

  return Querier;
}();

var EmptyQuery = function (_Querier) {
  _inherits(EmptyQuery, _Querier);

  function EmptyQuery() {
    _classCallCheck(this, EmptyQuery);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(EmptyQuery).call(this, []));
  }

  return EmptyQuery;
}(Querier);

var Query = function (_Querier2) {
  _inherits(Query, _Querier2);

  function Query(queryableObjects) {
    _classCallCheck(this, Query);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Query).call(this, queryableObjects));
  }

  /**
   * Executes the introduced Query
   * @param   {[Function]}  func  Function to get from Query
   * @return  {[T]}               Returns a T of Query type
   */


  _createClass(Query, [{
    key: "select",
    value: function select(func) {
      var keys = this.queryableObjects.map(function (item) {
        return item.name;
      });

      var middleMan = function middleMan() {
        for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
          keys[_key] = arguments[_key];
        }

        return function () {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return keys.reduce(function (ob, item) {
            ob[item] = args.shift();return ob;
          }, {});
        };
      };

      var bind = function bind(item, instruction, target) {
        return function () {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          return item[instruction](target.bind.apply(target, [item].concat(args)));
        };
      };

      return this.queryableObjects.reduceRight(function (func, item, idx, orig) {
        var entity = item.match({
          queryableObjectPath: function queryableObjectPath(entity) {
            return entity;
          },
          constraintObjectPath: function constraintObjectPath(entity, wheres) {
            return wheres.reduce(function (entity, clause) {
              return entity.where(clause);
            }, entity);
          }
        });

        return bind(entity, idx + 1 === orig.length ? 'select' : 'selectMany', func);
      }, middleMan.apply(undefined, _toConsumableArray(keys)))().select(func);
    }
  }]);

  return Query;
}(Querier);

//////////////////////
// Array Extensions //
//////////////////////

Array.prototype.select = function (func) {
  return this.length > 0 ? [func(this[0])].concat(this.slice(1).select(func)) : [];
};

Array.prototype.selectMany = function (func) {
  return this.length > 0 ? [].concat.apply([], [func(this[0])].concat(this.slice(1).selectMany(func))) : [];
};

Array.prototype.where = function (predicate) {
  return this.length > 0 ? predicate(this[0]) && [this[0]].concat(this.slice(1).where(predicate)) || this.slice(1).where(predicate) : [];
};

exports.default = new EmptyQuery();