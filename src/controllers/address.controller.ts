import { Response } from "express";
import Address from "../models/Address";
import { UserRequest } from "../middleware/userAuth.middleware";

export const addAddress = async (req: UserRequest, res: Response) => {
  const address = await Address.create({
    user: req.userId,
    ...req.body
  });

  res.status(201).json(address);
};

export const getAddresses = async (req: UserRequest, res: Response) => {
  const addresses = await Address.find({ user: req.userId });
  res.json(addresses);
};