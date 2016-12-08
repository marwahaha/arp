import arp from './arp0';

it('Basic Macros', () => {
  expect(arp("T!")).toBe(true);
  expect(arp("F!")).toBe(false);
  expect(arp("symbol!")).toBeInstanceOf(Function);
  expect(arp("[symbol! SYMB]")).toBe("SYMB");
});
