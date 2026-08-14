import { Router } from "express";
import { geocodeAddress } from "../services/geocodeService.js";

export const geocodeRouter = Router();

geocodeRouter.get("/geocode", async (req, res) => {
  const address = req.query.address;
  if (typeof address !== "string" || address.trim() === "") {
    res.status(400).json({ error: "address query parameter is required" });
    return;
  }

  try {
    const candidates = await geocodeAddress(address);
    if (candidates.length === 0) {
      res.status(404).json({ error: "address_not_found" });
      return;
    }
    res.json({ candidates });
  } catch (err) {
    res.status(502).json({ error: "geocode_service_unavailable" });
  }
});
