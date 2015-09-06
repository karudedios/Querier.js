import { NodeList, EmptyList } from '../fixture/models'
import { Querier } from '../../src/Querier'

describe("Querier", () => {

  describe("from/in", () => {
    let list = new NodeList(1, new NodeList(2, new NodeList(3, new EmptyList)));

    it("should allow you to do a selection from a type that supports the 'select' Method", () => {
      let result = Querier.build().from("item").in(list).select((item) => item + 2);
      expect(result).toEqual(list.select(x => x + 2));
    });

    it("shoud allow you to do a selection based on multiple from's in a type that supports 'selectMany'", () => {
      let result = Querier.build()
        .from("a").in(list)
        .from("b").in(list)
        .from("c").in(list)
        .select((a, b, c) => a + b + c);

      let whatShouldBe = list.selectMany(a => list.selectMany(b => list.select(c => a + b + c)));
      expect(result).toEqual(whatShouldBe);
    });

    it("should allow you to specify a 'where'", () => {
      /**
       * should be : $q['a'].where($q['_1']).select(a => a)
       * instead of: $q['a'].selectMany(function(a) { return $q['_1'](a).select(function(_1) { return cb(a); }); });
       */

      let result = Querier.build()
        .from('a').in(list)
        .where((a) => a % 2 === 0)
        .select((a) => a);


      expect(result).toEqual(list.where((h)=> h % 2 === 0))
    });
  });
});
