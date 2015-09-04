import { NodeList, EmptyList } from '../fixture/models'
import { Querier } from '../../src/Querier'

let list = new NodeList(1, new NodeList(2, new EmptyList));

console.log(
  Querier.new()
    .pipe({ from: list, as: 'a' })
    .pipe({ from: list, as: 'b' })
    .pipe({ from: list, as: 'c' })
    .select((a, b, c) => a + b + c)
)
