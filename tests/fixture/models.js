export default (() => {
  class List {
    constructor() {}

    match({ cons, nil }) {
      return this instanceof NodeList
        ? cons(this.value)
        : nil();
    }

    toArray() {
      return this.match({
        cons: (v) => [].concat([], [v], this.tail.toArray()),
        nil: () => []
      });
    }

    select(func) {
      return this.toArray().map(func).reduceRight((cons, item) => new NodeList(item, cons), new EmptyList);
    }

    selectMany(func) {
      return this.match({
        cons: (v) => [].concat([], [v], this.tail.selectMany(func)),
        nil: () => []
      })
       
    }
  }

  class EmptyList extends List {
    constructor() {
      super();
      this.isEmpty = true;
    }

    toString() {
      return `Emty List`;
    }
  }

  class NodeList extends List {
    constructor(value, tail) {
      super();
      Object.assign(this, { value, tail });
    }

    toString() {
      return this.tail instanceof NodeList
        ? `${this.value}, ` + this.tail.toString()
        : `${this.value}`;
    }
  }

  let list = new NodeList(1, new NodeList(2, new EmptyList));
  console.log(
    list.selectMany(x => list.select(y => x + y))
  )

  return { NodeList, EmptyList }
})();