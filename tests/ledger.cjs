const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx={structuredClone};vm.createContext(ctx);vm.runInContext(fs.readFileSync('./inventory.js','utf8')+'\n'+fs.readFileSync('./ledger.js','utf8')+';globalThis.rules=Ledger;',ctx);const L=ctx.rules;
const base={version:1,products:[{id:'p',name:'قهوة',price:4500,cost:3000,quantity:10,barcode:'123'}],customers:[{id:'c',name:'زبون الاختبار'}],transactions:[],cart:[{productId:'p',quantity:2}]};
const expected=L.signature(L.quote(base));const sale=L.sale(base,{id:'s1',at:'2026-11-24T09:00:00Z',type:'credit_sale',customerId:'c',expected});
assert.equal(base.products[0].quantity,10,'input unchanged');assert.equal(base.transactions.length,0);assert.equal(sale.products[0].quantity,8);assert.equal(sale.cart.length,0);assert.equal(L.balance(sale,'c'),900000);assert.equal(sale.transactions[0].profitCents,300000);
let paid=L.payment(sale,{id:'pay1',at:'2026-11-24T10:00:00Z',customerId:'c',amount:'4000',notes:'دفعة'});assert.equal(L.balance(paid,'c'),500000);assert.equal(paid.products[0].quantity,8);assert.equal(sale.transactions.length,1);assert.equal(paid.transactions.at(-1).type,'debt_payment');
assert.throws(()=>L.payment(paid,{id:'over',customerId:'c',amount:'5000.01'}));for(const amount of ['',0,-1,'NaN'])assert.throws(()=>L.payment(paid,{id:'bad',customerId:'c',amount}));
assert.throws(()=>L.payment(paid,{id:'pay1',customerId:'c',amount:1}));
paid=L.payment(paid,{id:'pay2',at:'2026-11-24T11:00:00Z',customerId:'c',amount:5000});assert.equal(L.balance(paid,'c'),0);assert.equal(L.balance(JSON.parse(JSON.stringify(paid)),'c'),0);
assert.throws(()=>L.sale(sale,{id:'s1',type:'credit_sale',customerId:'c',expected}));assert.throws(()=>L.sale(base,{id:'bad',type:'credit_sale',customerId:'missing',expected}));
const insufficient=structuredClone(base);insufficient.products[0].quantity=1;assert.throws(()=>L.sale(insufficient,{id:'bad',type:'credit_sale',customerId:'c',expected}));assert.equal(insufficient.products[0].quantity,1);assert.equal(insufficient.transactions.length,0);
const changed=structuredClone(base);changed.products[0].price=5000;assert.throws(()=>L.sale(changed,{id:'bad',type:'credit_sale',customerId:'c',expected}));
const cash=L.sale(base,{id:'cash',type:'cash_sale',expected});assert.equal(L.balance(cash,'c'),0);assert.equal(cash.transactions[0].customerId,null);assert.equal(cash.products[0].quantity,8);
const decimal=structuredClone(base);decimal.products[0].price=.1;decimal.products[0].cost=.03;decimal.cart[0].quantity=3;assert.equal(L.quote(decimal).totalCents,30);assert.equal(L.cents('١٢٫٥٠'),1250);assert.throws(()=>L.customer({name:' '}));assert.equal(L.customer({name:'  علي  ',phone:'0770'}).name,'علي');
console.log('PASS: credit/cash sales, inventory atomicity, partial/full repayment, overpayment, duplicate/stale submission, decimal amounts and persistence round trip');

