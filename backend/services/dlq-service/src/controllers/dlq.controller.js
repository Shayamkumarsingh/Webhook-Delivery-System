import { getAllDLQ,retryFromDLQ,deleteDLQ } from "../services/dlq.service.js";

export const getAll = async (req, res, next) => {
  try {
    const dlqEntries = await getAllDLQ();
    res.status(200).json({ success: true, data: dlqEntries });
  } catch (err) {
    next(err);
  }
};

export const retry = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await retryFromDLQ(id);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    await deleteDLQ(id);
    res.status(200).json({ success: true, message: "DLQ entry deleted successfully" });
  } catch (err) {
    next(err);
  }
};