import arp from './arp0';

it('Basic Macros', () => {
  expect(arp("T!")).toBe(true);
  expect(arp("F!")).toBe(false);

  expect(arp("symbol!")).toBeInstanceOf(Function);
  expect(arp("[symbol! SYMB]")).toBe("SYMB");
  expect(arp("[symbol! 7990]")).toBe("7990");

  expect(arp("literal!")).toBeInstanceOf(Function);
  expect(arp("[literal! 7990]")).toEqual(["7990"]);
});
