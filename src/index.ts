import { config } from "dotenv";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import logger from "./logs/logger";

config();
const endpoint = process.env.HELIUS_RPC || clusterApiUrl("mainnet-beta");
const connection = new Connection(endpoint, { commitment: "confirmed" });
const PUMP_FUN_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
const PUMP_AMM_PROGRAM = new PublicKey(
  "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"
);

async function main(connection: Connection, splToken: string) {
  const spl = new PublicKey(splToken);
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), spl.toBuffer()],
    PUMP_FUN_PROGRAM
  );
  // const [ammMarket] = PublicKey.findProgramAddressSync([Buffer.from("amm-pool"), spl.toBuffer()], PUMP_AMM_PROGRAM);
  console.log("💊BondingCurve: ", bondingCurve.toString());
  // console.log("bondingCurve: ",bondingCurve)
  // console.log("bondingCurve: ",Buffer.from("bonding-curve"));
  // const accInfo = await connection.getAccountInfo(bondingCurve);
  // console.log("Acc: ", accInfo)
  // const accounts = await connection.getProgramAccounts(PUMP_AMM_PROGRAM);
  // console.log(JSON.stringify(accounts[4].account.data,null,2))

  // const markets = accounts.filter((account) => {
  //   const data = account.account.data;
  //   // Parse data to check if it matches the token mint address
  //   // This depends on the program's specific data structure
  //   return data.includes(spl.toBuffer());
  // });
  // console.log('Market Addresses:', markets.map((market) => market.pubkey.toString()));
  // console.log("bondingCurve: ", bondingCurve)

  // const Txns = await connection.getSignaturesForAddress(bondingCurve);
  // console.log(Txns.length)
  // for(let i=0; i<Txns.length; i++){
  //   console.log(`🐋Txn ${i+1}: `,Txns[i]);
  // }
  const allsigns = await getAllSignaturesForAddress(connection, bondingCurve);
  // const allsigns = await getAllSignaturesForAddress(connection, new PublicKey("HMT2aYoqAZmrDhExvp3aTabXwUVgHAJe8CP6JGU8oRcj"));
  console.log("Length: ",allsigns.length);
  for (let i = 0; i < allsigns.length; i++) {
    console.log(`🐋Txn ${i + 1}: `, allsigns[i]);
    const detail = await connection.getParsedTransaction(allsigns[i], {commitment:"confirmed", maxSupportedTransactionVersion: 0})
    console.log(`📚 Txn Detail: `,detail?.blockTime, detail?.transaction.message.instructions)
  }
}

main(connection, "AzfRsjf8GzzLNm71QCdvJ79t6AvraLQwPV4jbVPZpump");

async function getAllSignaturesForAddress(
  connection: Connection,
  address: PublicKey
) {
  let before: string = "";
  let limit: number = 1000;
  let allsigns: string[] = [];
  let signs;
  do {
    console.log(before);
    if (before == "") {
      signs = await connection.getSignaturesForAddress(address);
      if (signs.length > 0) {
        allsigns.push(...signs.map((sig) => sig.signature));
        before = signs[signs.length - 1].signature;
      }
    } else {
      signs = await connection.getSignaturesForAddress(address, { before });
      if (signs.length > 0) {
        allsigns.push(...signs.map((sig) => sig.signature));
        before = signs[signs.length - 1].signature;
      }
    }
  } while (signs.length >= limit);
  console.log(allsigns.length);
  return allsigns;
}

// 2M3sijgeveUicEFKghA1937MuPNf1dJTEGcGjQfuuuYM
// 2mGGv92Pp5Mfw2U56LDWyqS1c5xMW2djW71BSc7KUejb
// G4uLm1BpsfonxpA7Jwx2dxYQRXsUXYV9GCg8r7azX5w9
