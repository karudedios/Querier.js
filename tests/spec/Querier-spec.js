import { NodeList, EmptyList } from '../fixture/models'
import { Querier } from '../../src/Querier'

describe("Querier", () => {

  describe("pipe", () => {
    let list = new NodeList(1, new NodeList(2, new NodeList(3, new EmptyList)));

    it("should allow you to do a selection from a type that supports the 'select' Method", () => {
      let result = Querier
        .append({ as: 'item', from: list })
        .select((item) => item + 2);

      let whatShouldBe = list.select(x => x + 2);
      expect(result).toEqual(whatShouldBe);
    });

    it("shoud allow you to do a selection based on multiple from's in a type that supports 'selectMany'", () => {
      let result = Querier
        .append({ as: 'a', from: list })
        .append({ as: 'b', from: list })
        .append({ as: 'c', from: list })
        .select((a, b, c) => a + b + c);

      let whatShouldBe = list.selectMany(a => list.selectMany(b => list.select(c => a + b + c)));
      expect(result).toEqual(whatShouldBe);
    });

    it("should allow you to specify a 'where'", () => {
      let result = Querier
        .append({ as: 'a', from: list, where: (a) => a % 2 === 0 })
        .select((a) => a);

      let whatShouldBe = list.where((h)=> h % 2 === 0);
      expect(result).toEqual(whatShouldBe);
    });

    it("should work with multiple clauses", () => {
      let result = Querier
        .append({ as: 'a', from: list, where: (a) => a % 2 == 0 })
        .append({ as: 'b', from: list, where: (b) => b % 3 == 0 })
        .select((a, b) => a + b);

      let whatShouldBe = list.where(x => x % 2 === 0).selectMany(a => list.where(x => x % 3 === 0).select(b => a + b))
      expect(result).toEqual(whatShouldBe);
    });
  });
});
