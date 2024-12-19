import { Podio } from "./APIs/podioAPI";
import  { FilterOptions, PodioCreatedBy, PodioCreatedVia, MultiSelectionFieldValue, WebhookOptions, Webhook } from "./types/podio_types";
import express from "express";
import fs from "fs";





export default async function Main(): Promise<void> {
  const cpd = new Podio({
    clientId: <string>process.env.PODIO_CLIENT_ID,
    clientSecret: <string>process.env.PODIO_CLIENT_SECRET,
    username: <string>process.env.PODIO_USER,
    password: <string>process.env.PODIO_PASSWORD
  });



}

Main();

