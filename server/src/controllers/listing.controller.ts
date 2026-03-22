// controllers/listingController.ts
import { Request, Response, NextFunction } from "express";
import {
  createListingService,
  getListingsService,
  getListingByIdService,
  deleteListingService,
} from "../services/listing.service";

export async function createListing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const listing = await createListingService(req.user!.userId!, req.body);
    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
}

export async function getListings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const listings = await getListingsService(req.query as Record<string, string | undefined>);
    res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
}

export async function getListingById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    const listing = await getListingByIdService(listingId);
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
}

export async function deleteListing(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { listingId } = req.params;
    await deleteListingService(req.user!.userId!, listingId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
