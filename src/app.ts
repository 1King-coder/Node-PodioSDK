import { Podio } from "./APIs/podioAPI";


require("dotenv").config();



export default async function Main(): Promise<void> {
  const pd = new Podio({
    clientId: <string>process.env.PODIO_CLIENT_ID,
    clientSecret: <string>process.env.PODIO_CLIENT_SECRET,
    username: <string>process.env.PODIO_USER,
    password: <string>process.env.PODIO_PASSWORD
  }, "./podio_token.json");

}

Main();

