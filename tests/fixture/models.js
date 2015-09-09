export default (() => {
  class List {
    constructor(isEmpty) {
      Object.defineProperty(this, 'isEmpty', { value: isEmpty });
    }
    
    /**
     * Method to decide the path the List object will take
     * @param   {[Function]}  options.node    Path when the object is a NodeList
     * @param   {[Function]}  options.empty   Path when the object is an EmptyList
     * @return  {[T]}                         Result of node or empty
     */
    match({ node, empty }) {
      return this instanceof NodeList
        ? node(this.head, this.tail)
        : empty();
    }

    /**
     * Method to concatenate a List to another List
     * @param   {[List]}  list  List to concatenate
     * @return  {[List]}        Result of Concatenation
     */
    concat(list) {
      return this.match({
        node: (h, t) => new NodeList(h, t.concat(list)),
        empty: () => list
      });
    }

    /**
     * Function that selects items with the applied function
     * @param   {[Function]}  func  Function to apply
     * @return  {[List]}            Result of applying func to every item in the list
     */
    select(func) {
      return this.match({
        node: (h, t) => new NodeList(func(h), t.select(func)),
        empty: () => this
      });
    }

    /**
     * Function that selects T with the applied function
     * @param   {[Function]}  func  Function that returns a List
     * @return  {[List]}            List with the applied function
     */
    selectMany(func) {
      return this.match({
        node: (h, t) => func(h).concat(t.selectMany(func)),
        empty: () => this
      });
    }

    /**
     * Function that filters current List
     * @param   {[Function]}  predicate Function to filter with
     * @return  {[List]}                Filtered List
     */
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
    constructor(head, tail) {
      super(false);
      Object.assign(this, { head, tail });
    }

    toString() {
      return this.tail instanceof NodeList
        ? `${this.head}, ${this.tail.toString()}`
        : `${this.head}`;
    }
  }

  return { NodeList, EmptyList }
})();