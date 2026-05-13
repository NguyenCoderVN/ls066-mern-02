import AppError from "../../utils/appError.js";

export const findEntityOrThrow = async (
  Model,
  query,
  entityName = "Resource",
) => {
  const data = await Model.findOne(query);
  if (!data) throw new AppError(`${entityName} not found`, 404);
  return data;
};
