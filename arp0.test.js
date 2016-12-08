import arp from './arp0';

it('Basic Macros', () => {
  expect(arp("T!")).toBe("T!");
  expect(arp("F!")).toBe("F!");
  expect(arp("symbol!")).toBeInstanceOf(Function);
});
