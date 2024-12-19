import { Podio } from "./APIs/podioAPI";






export default async function Main(): Promise<void> {
  const pd = new Podio({
    clientId: <string>process.env.PODIO_CLIENT_ID,
    clientSecret: <string>process.env.PODIO_CLIENT_SECRET,
    username: <string>process.env.PODIO_USER,
    password: <string>process.env.PODIO_PASSWORD
  }, "./podio_token.json");

  console.log(await pd.Items.GetItemByAppItemId(29317684, 752))

}

Main();

