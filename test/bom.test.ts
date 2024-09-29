import {parseString} from '../src/xml2js';
import { equal } from 'assert';
const equ = equal;

describe("bom", function ()
{
  test("decoded BOM", function (done)
  {
    const demo = '\uFEFF<xml><foo>bar</foo></xml>';
    parseString(demo, (err: unknown, res: { xml: { foo: unknown[]; }; }) => {
      equ(err, undefined); 
      equ(res.xml.foo[0], 'bar'); 
    });
    done()
  })
})
