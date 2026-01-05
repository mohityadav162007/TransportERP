import dns from 'dns';
const host = 'db.mdtmgoxsqynwxtputyat.supabase.co';
console.log(`Looking up ${host}...`);
dns.lookup(host, { all: true }, (err, addresses) => {
    if (err) console.error(err);
    else console.log(addresses);
});
