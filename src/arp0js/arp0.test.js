import arp from './arp0';

it('Basic Macros', () => {
  expect(arp("T!")).toBe(true);
  expect(arp("F!")).toBe(false);

  expect(arp("symbol!")).toBeInstanceOf(Function);
  expect(arp("[symbol! SYMB]")).toBe("SYMB");
  expect(arp("[symbol! 7990]")).toBe("7990");
  expect(arp('[symbol! T!]')).toBe("T!");
  expect(arp('[[symbol! T!]]')).toBe(true);

  expect(arp("literal!")).toBeInstanceOf(Function);
  expect(arp("[literal! 7990]")).toEqual(["7990"]);
  expect(arp("[literal! 7990 test]")).toEqual(["7990", "test"]);
  expect(arp("[literal! literal! test]")).toEqual(["literal!", "test"]);
  expect(arp("[[literal! literal! test]]")).toEqual(["test"]);

  expect(arp("let!")).toBeInstanceOf(Function);
  expect(arp("[let! aName T!]")).toEqual(true);
  expect(arp("[let! aName F!]")).toEqual(false);
  expect(arp("[let! aName [symbol! sss]]")).toEqual('sss');
  expect(arp("[let! aName [symbol! sss]] aName")).toEqual('sss');

  expect(arp("let-mut!")).toBeInstanceOf(Function);
  expect(arp("assign!")).toBeInstanceOf(Function);
  expect(arp("[let-mut! aName [symbol! sss]] aName")).toEqual('sss');
  expect(arp("[let-mut! aName [symbol! sss]] [assign! aName [symbol! goopher]] aName")).toEqual('goopher');

  expect(arp("decide!")).toBeInstanceOf(Function);
  expect(arp("[decide! T! [symbol! a] [symbol! b]]")).toEqual('a');
  expect(arp("[decide! F! [symbol! a] [symbol! b]]")).toEqual('b');

  expect(arp("do!")).toBeInstanceOf(Function);
  expect(arp("[do! [symbol! 1] [symbol! 2]]")).toEqual('2');
  expect(arp("[do! [symbol! 1] [symbol! test]]")).toEqual('test');
  expect(arp("[let! SYM T!] [do! SYM]")).toEqual(true);
  expect(arp("[let-mut! SYM T!] [do! [assign! SYM F!] SYM]")).toEqual(false);
  expect(arp("[let-mut! SYM T!] [do! [assign! SYM F!]] SYM")).toEqual(false);
  expect(arp("[let-mut! SYM T!] [do! [let! SYM F!]] SYM")).toEqual(true);

  expect(arp("loop!")).toBeInstanceOf(Function);
  expect(arp("break!")).toBeInstanceOf(Function);
  expect(arp("[let-mut! i F!][loop! [decide! i [break! i] [assign! i T!]]]")).toEqual(true);
  expect(arp("[let-mut! i T!][loop! [decide! i [assign! i F!] [break! i]]]")).toEqual(false);

  expect(arp("macro!")).toBeInstanceOf(Function);
  expect(arp("[[macro! PARAMS PARAMS] T!]")).toEqual(['T!']);
  expect(arp("[[macro! PARAMS PARAMS] F!]")).toEqual(['F!']);
  expect(arp("[[macro! PARAMS T!] F!]")).toEqual(true);
});

it('Basic Functions', () => {
  expect(arp("head")).toBeInstanceOf(Function);
  expect(arp("[head [literal! test]]")).toEqual("test");
  expect(arp("[head [literal! test test2]]")).toEqual("test");
  expect(arp("[tail [literal! test]]")).toEqual([]);
  expect(arp("[tail [literal! test test2]]")).toEqual(['test2']);
  expect(arp("[head [tail [literal! test test2]]]")).toEqual('test2');

  expect(arp('=')).toBeInstanceOf(Function);
  expect(arp('[= T! T!]')).toBe(true);
  expect(arp('[= F! F!]')).toBe(true);
  expect(arp('[= T! F!]')).toBe(false);
  expect(arp('[= F! T!]')).toBe(false);
  expect(arp('[= [symbol! test] [symbol! test]]')).toBe(true);
  expect(arp('[= [symbol! test] [symbol! test2]]')).toBe(false);

  expect(arp('ordered?')).toBeInstanceOf(Function);
});
