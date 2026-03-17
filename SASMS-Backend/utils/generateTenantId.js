import Admin from "../models/Admin.js";

export const generateTenantId = async () => {

  const lastAdmin = await Admin.findOne().sort({ createdAt:-1 });

  let next = 1;

  if(lastAdmin){
    const last = parseInt(lastAdmin.tenantId.split("-")[2]);
    next = last + 1;
  }

  return `SASMS-TEN-${String(next).padStart(3,"0")}`;
};