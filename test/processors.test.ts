import processors from '../src/processors';
import * as xml2js from '../src/xml2js';
import assert from 'assert';
const equ = assert.equal;

const parseNumbersExceptAccount = function (value: string, key: string) {
  if (key === 'accountNumber') {
    return value;
  }
  return processors.parseNumbers(value);
};

describe('processors', function ()
{
  test('normalize', function (done) {
    const demo = 'This shOUld BE loWErcase';
    const result = processors.normalize(demo);
    equ(result, 'this should be lowercase');
    done();
  });

  test('firstCharLowerCase', function (done) {
    const demo = 'ThiS SHould OnlY LOwercase the fIRST cHar';
    const result = processors.firstCharLowerCase(demo);
    equ(result, 'thiS SHould OnlY LOwercase the fIRST cHar');
    done();
  });

  test('stripPrefix', function (done) {
    const demo = 'stripMe:DoNotTouch';
    const result = processors.stripPrefix(demo);
    equ(result, 'DoNotTouch');
    done();
  });

  test('stripPrefix, ignore xmlns', function (done) {
    const demo = 'xmlns:shouldHavePrefix';
    const result = processors.stripPrefix(demo);
    equ(result, 'xmlns:shouldHavePrefix');
    done();
  });

  test('parseNumbers', function (done) {
    equ(processors.parseNumbers('0'), 0);
    equ(processors.parseNumbers('123'), 123);
    equ(processors.parseNumbers('15.56'), 15.56);
    equ(processors.parseNumbers('10.00'), 10);
    done();
  });

  test('parseBooleans', function (done) {
    equ(processors.parseBooleans('true'), true);
    equ(processors.parseBooleans('True'), true);
    equ(processors.parseBooleans('TRUE'), true);
    equ(processors.parseBooleans('false'), false);
    equ(processors.parseBooleans('False'), false);
    equ(processors.parseBooleans('FALSE'), false);
    equ(processors.parseBooleans('truex'), 'truex');
    equ(processors.parseBooleans('xtrue'), 'xtrue');
    equ(processors.parseBooleans('x'), 'x');
    equ(processors.parseBooleans(''), '');
    done();
  });

  test('a processor that filters by node name', function (done) {
    const xml = '<account><accountNumber>0012345</accountNumber><balance>123.45</balance></account>';
    const options = { valueProcessors: [parseNumbersExceptAccount] };
    xml2js.parseString(xml, options, function (err: any, parsed: { account: { accountNumber: unknown; balance: unknown; }; }) {
      equ(parsed.account.accountNumber, '0012345');
      equ(parsed.account.balance, 123.45);
      done();
    });
  });

  test('a processor that filters by attr name', function (done) {
    const xml = '<account accountNumber="0012345" balance="123.45" />';
    const options = { attrValueProcessors: [parseNumbersExceptAccount] };
    xml2js.parseString(xml, options, function (err: any, parsed: { account: { $: { accountNumber: unknown; balance: unknown; }; }; }) {
      equ(parsed.account.$.accountNumber, '0012345');
      equ(parsed.account.$.balance, 123.45);
      done();
    });
  })
})