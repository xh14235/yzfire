import { get, post } from "./http";

export const login = (params) => post("/admin/admin/portal/login", params);
export const getNavList = (params) => get("/energy/building/findAll", params);
export const getRobotList = (params) =>
  get("/energy/detector/findByBuilding" + params);
export const getTemplate = (params) =>
  get("/energy/temperature/find/dateInterval", params);
export const getElectric = (params) =>
  get("/energy/electric/find/dateInterval", params);
export const getVoltage = (params) =>
  get("/energy/voltage/find/dateInterval", params);
