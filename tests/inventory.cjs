const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};vm.createContext(context);
vm.runInContext(fs.readFileSync('./inventory.js','utf8')+';globalThis.rules=InventoryData;',context);
const r=context.rules,categories=[{id:'drinks',name:'مشروبات'}];
const valid={name:'قهوة',categoryId:'drinks',cost:'3000',price:'4500',quantity:'5',barcode:'123'};
const p=r.product(valid,[],categories);assert.equal(p.price-p.cost,1500);assert.equal(p.quantity*p.cost,15000);
for(const patch of [{name:' '},{cost:''},{price:''},{quantity:''},{cost:'-1'},{price:'Infinity'},{quantity:'1.5'},{quantity:'-1'},{quantity:'1000000001'},{categoryId:'missing'}])assert.throws(()=>r.product({...valid,...patch},[],categories));
assert.equal(r.product({...valid,cost:'٠',price:'١٢٫٥',quantity:'٠'},[],categories).price,12.5);
assert.throws(()=>r.product(valid,[{...p,id:'old'}],categories),'duplicate barcode');
assert.equal(r.product(valid,[{...p,id:'old'}],categories,'old').barcode,'123');
assert.equal(r.category('  جديد  ',categories),'جديد');assert.throws(()=>r.category('مشروبات',categories));assert.throws(()=>r.category('الكل',categories));assert.throws(()=>r.category('بدون تصنيف',categories));assert.equal(r.category('مشروبات',categories,'drinks'),'مشروبات');
assert.equal(r.increase(5,'10'),15);assert.throws(()=>r.increase(5,'0'));assert.throws(()=>r.increase(5,'-2'));assert.throws(()=>r.increase(5,'1.2'));assert.throws(()=>r.increase(1e9,'1'));
assert.equal(r.stock(0),'empty');assert.equal(r.stock(1),'low');assert.equal(r.stock(5),'low');assert.equal(r.stock(6),'available');
assert.equal(r.filter([p],'قهوة','all').length,1);assert.equal(r.filter([p],'123','drinks').length,1);assert.equal(r.filter([p],'123','uncategorized').length,0);assert.equal(r.filter([{...p,categoryId:''}],'','uncategorized').length,1);
console.log('PASS: inventory validation, profit/value, barcode uniqueness, filters and stock boundaries');

