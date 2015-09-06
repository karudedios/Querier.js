export default (() => {
  class List {
    constructor(isEmpty) {
      Object.defineProperty(this, 'isEmpty', { value: isEmpty });
    }

    match({ node, empty }) {
      return this instanceof NodeList
        ? node(this.value, this.tail)
        : empty();
    }

    concat(list) {
      return this.match({
        node: (h, t) => new NodeList(h, t.concat(list)),
        empty: () => list
      });
    }

    select(func) {
      return this.match({
        node: (h, t) => new NodeList(func(h), t.select(func)),
        empty: () => this
      });
    }

    selectMany(func) {
      return this.match({
        node: (h, t) => func(h).concat(t.selectMany(func)),
        empty: () => this
      });
    }

    where(predicate) {
      return this.match({
        node: (h, t) => predicate(h) ? new NodeList(h, t.where(predicate)) : t.where(predicate),
        empty: () => new EmptyList
      });
    }
  }

  class EmptyList extends List {
    constructor() {
      super(true);
    }

    toString() {
      return `Empty List`;
    }
  }

  class NodeList extends List {
    constructor(value, tail) {
      super(false);
      Object.assign(this, { value, tail });
    }

    toString() {
      return this.tail instanceof NodeList
        ? `${this.value}, ` + this.tail.toString()
        : `${this.value}`;
    }
  }

  return { NodeList, EmptyList }
})();