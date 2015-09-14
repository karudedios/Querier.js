import { NodeList, EmptyList } from '../fixture/models'
import { Querier } from '../../src/Querier'

describe("Querier", () => {

  describe("exception handling", () => {
    class ObjectWithoutSelect {}
    class ObjectWithoutSelectMany { select() {} }
    class ObjectWithoutWhere { select() {} selectMany() {} }

    it("should throw an exception when 'as' is not provided", () => {
      let expected = "'as' should be a string representing the alias of the object you want to query";
      
      let failingFunction = () => Querier.append({ from: new ObjectWithoutSelectMany });
      
      expect(failingFunction).toThrow(expected)
    });

    it("should throw an exception when 'from' is not provided", () => {
      let expected = "'from' cannot be empty";
      
      let failingFunction = () => Querier.append({ as: 'fail' });
      
      expect(failingFunction).toThrow(expected)
    });

    it("should throw an exception when an object without 'select' clause is used", () => {
      let expected = "The selected Object doesn't posses a 'select' clause to use";
      
      let failingFunction = () => Querier.append({ as: 'fail', from: new ObjectWithoutSelect });
      
      expect(failingFunction).toThrow(expected)
    });

    it("should throw an exception when several objects without 'selectMany' clause are used", () => {
      let expected = "Some of the selected objects doesn't posses a 'selectMany' so multiple objects cannot be enumerated";
      
      let failingFunction = () => Querier
        .append({ as: 'fail1', from: new ObjectWithoutSelectMany })
        .append({ as: 'fail2', from: new ObjectWithoutSelectMany });

      expect(failingFunction).toThrow(expected);
    });

    it("should throw an exception when an objects without 'where' clause is used", () => {
      let expected = "The selected Object doesn't posses a 'where' clause to use";
      
      let failingFunction = () => Querier
        .append({ as: 'fail', from: new ObjectWithoutWhere, where: (fail) => true });

      expect(failingFunction).toThrow(expected);
    });

    it("should throw an exception when different objects try to be enumerated", () => {
      let expected = "Only objects of the same instance can be enumerated in a single query";
      
      let failingFunction = () => Querier
        .append({ as: 'fail1', from: new ObjectWithoutWhere })
        .append({ as: 'fail2', from: new ObjectWithoutSelectMany })
        .append({ as: 'fail3', from: new ObjectWithoutSelect });

      expect(failingFunction).toThrow(expected);
    });
  });

  describe("append", () => {
    let list = new NodeList(1, new NodeList(2, new NodeList(3, new EmptyList)));

    it("should allow you to do a selection from a type that supports the 'select' Method", () => {
      let result = Querier
        .append({ as: 'item', from: list })
        .select(({item}) => item + 2);

      let whatShouldBe = list.select(x => x + 2);
      expect(result).toEqual(whatShouldBe);
    });

    it("shoud allow you to do a selection based on multiple from's in a type that supports 'selectMany'", () => {
      let result = Querier
        .append({ as: 'a', from: list })
        .append({ as: 'b', from: list })
        .append({ as: 'c', from: list })
        .select(({a, b, c}) => a + b + c);

      let whatShouldBe = list.selectMany(a => list.selectMany(b => list.select(c => a + b + c)));
      expect(result).toEqual(whatShouldBe);
    });

    it("should allow you to specify a 'where'", () => {
      let result = Querier
        .append({ as: 'a', from: list, where: (a) => a % 2 === 0 })
        .select(({a}) => a);

      let whatShouldBe = list.where((h)=> h % 2 === 0);
      expect(result).toEqual(whatShouldBe);
    });

    it("should work with multiple clauses", () => {
      let result = Querier
        .append({ as: 'a', from: list, where: (a) => a % 2 == 0 })
        .append({ as: 'b', from: list, where: (b) => b % 3 == 0 })
        .select(({a, b}) => a + b);

      let whatShouldBe = list.where(x => x % 2 === 0).selectMany(a => list.where(x => x % 3 === 0).select(b => a + b))
      expect(result).toEqual(whatShouldBe);
    });

    it("should execute select properly regardless of the order of the params", () => {
      let result = Querier
        .append({ as: 'a', from: list })
        .append({ as: 'b', from: list })
        .append({ as: 'c', from: list })
        .select(({c, b, a}) => (a + b) / c);

      let whatShouldBe = list.selectMany(a => list.selectMany(b => list.select(c => (a + b) / c)));
      expect(result).toEqual(whatShouldBe);
    });
  });
});
