
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const PAY_TABLE_YEAR = 2026;
const YOS_BRACKETS = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 38, 40];

const PAY_TABLES = {
  2023: {
    "E-1":[1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918],
    "E-2":[2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149],
    "E-3":[2260,2402,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548],
    "E-4":[2503,2632,2774,2915,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039],
    "E-5":[2730,2914,3055,3199,3424,3658,3851,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875],
    "E-6":[2980,3280,3425,3565,3712,4042,4171,4420,4496,4552,4616,4616,4616,4616,4616,4616,4616,4616,4616],
    "E-7":[3446,3761,3905,4095,4245,4500,4645,4900,5114,5259,5413,5473,5675,5782,6193,6193,6193,6193,6193],
    "E-8":[null,null,null,null,null,4957,5176,5312,5474,5651,5969,6130,6404,6556,6931,7070,7070,7070,7070],
    "E-9":[null,null,null,null,null,null,6055,6193,6366,6569,6775,7103,7382,7674,8121,8527,8954,9402,9402],
    "W-1":[3555,3938,4041,4258,4515,4894,5071,5318,5562,5753,5939,6154,6154,6154,6154,6154,6154,6154,6154],
    "W-2":[4050,4433,4551,4632,4895,5303,5505,5704,5948,6139,6323,6529,6666,6773,6773,6773,6773,6773,6773],
    "W-3":[4577,4768,4964,5028,5232,5636,6056,6254,6483,6718,7155,7441,7612,7794,8044,8044,8044,8044,8044],
    "W-4":[5012,5392,5546,5698,5961,6220,6483,6878,7224,7554,7838,8101,8487,8808,9170,9353,9353,9353,9353],
    "W-5":[null,null,null,null,null,null,null,null,null,null,null,8929,9381,9718,10092,10598,11126,11683,11683],
    "O-1":[3637,3786,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577],
    "O-2":[4191,4773,5497,5682,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799],
    "O-3":[4850,5498,5934,6470,6780,7120,7340,7702,7890,7890,7890,7890,7890,7890,7890,7890,7890,7890,7890],
    "O-4":[5516,6385,6812,6906,7302,7726,8255,8666,8951,9115,9210,9210,9210,9210,9210,9210,9210,9210,9210],
    "O-5":[6393,7202,7700,7794,8106,8292,8701,9002,9389,9983,10265,10545,10862,10862,10862,10862,10862,10862,10862],
    "O-6":[7669,8425,8978,8978,9013,9399,9450,9450,9987,10936,11494,12050,12368,12689,13311,13577,13577,13577,13577],
    "O-7":[10113,10583,10800,10973,11286,11595,11953,12309,12667,13790,14737,14737,14737,14737,14814,15110,15110,15110,15110],
    "O-8":[12171,12570,12834,12908,13239,13790,13918,14442,14592,15043,15697,16299,16701,16701,16701,17119,17546,17546,17546],
    "O-9":[null,null,null,null,null,null,null,null,null,null,null,17201,17449,17578,17578,17578,17578,17578,17578],
    "O-10":[null,null,null,null,null,null,null,null,null,null,null,17578,17578,17578,17578,17578,17578,17578,17578],
  },
  2024: {
    "E-1":[2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017],
    "E-2":[2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261],
    "E-3":[2378,2527,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680],
    "E-4":[2634,2769,2918,3067,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197],
    "E-5":[2872,3066,3214,3366,3602,3849,4052,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076],
    "E-6":[3135,3450,3603,3751,3905,4252,4388,4650,4730,4788,4856,4856,4856,4856,4856,4856,4856,4856,4856],
    "E-7":[3625,3956,4108,4308,4465,4734,4886,5155,5380,5532,5695,5758,5970,6083,6515,6515,6515,6515,6515],
    "E-8":[null,null,null,null,null,5215,5445,5588,5759,5945,6279,6449,6737,6897,7291,7438,7438,7438,7438],
    "E-9":[null,null,null,null,null,null,6370,6515,6697,6910,7127,7472,7765,8073,8544,8970,9419,9891,9891],
    "W-1":[3740,4143,4251,4479,4750,5149,5335,5595,5851,6052,6238,6463,6463,6463,6463,6463,6463,6463,6463],
    "W-2":[4261,4664,4788,4873,5149,5579,5792,6001,6257,6458,6638,6855,6998,7111,7111,7111,7111,7111,7111],
    "W-3":[4815,5016,5222,5290,5504,5929,6371,6579,6820,7067,7513,7814,7993,8184,8445,8445,8445,8445,8445],
    "W-4":[5273,5672,5835,5995,6271,6544,6820,7235,7600,7947,8232,8508,8914,9249,9629,9822,9822,9822,9822],
    "W-5":[null,null,null,null,null,null,null,null,null,null,null,9376,9851,10205,10597,11128,11684,12269,12269],
    "O-1":[3826,3983,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815],
    "O-2":[4409,5021,5782,5978,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101],
    "O-3":[5102,5783,6242,6806,7133,7490,7722,8102,8301,8301,8301,8301,8301,8301,8301,8301,8301,8301,8301],
    "O-4":[5803,6717,7166,7265,7682,8128,8684,9116,9417,9589,9689,9689,9689,9689,9689,9689,9689,9689,9689],
    "O-5":[6726,7577,8101,8200,8527,8723,9153,9470,9878,10502,10799,11093,11427,11427,11427,11427,11427,11427,11427],
    "O-6":[8068,8864,9445,9445,9481,9888,9941,9941,10506,11505,12091,12677,13011,13349,14003,14283,14283,14283,14283],
    "O-7":[10639,11133,11362,11544,11873,12198,12574,12949,13325,14507,15504,15504,15504,15504,15584,15896,15896,15896,15896],
    "O-8":[12804,13223,13502,13579,13927,14507,14642,15193,15351,15826,16513,17146,17569,17569,17569,18009,18458,18458,18458],
    "O-9":[null,null,null,null,null,null,null,null,null,null,null,18096,18357,18492,18492,18492,18492,18492,18492],
    "O-10":[null,null,null,null,null,null,null,null,null,null,null,18492,18492,18492,18492,18492,18492,18492,18492],
  },
  2025: {
    "E-1":[2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108],
    "E-2":[2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363],
    "E-3":[2485,2641,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801],
    "E-4":[2752,2893,3050,3205,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341],
    "E-5":[3002,3204,3359,3517,3764,4022,4234,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260],
    "E-6":[3277,3606,3765,3920,4081,4444,4585,4859,4943,5004,5075,5075,5075,5075,5075,5075,5075,5075,5075],
    "E-7":[3788,4134,4293,4502,4666,4947,5106,5387,5622,5781,5951,6017,6238,6357,6809,6809,6809,6809,6809],
    "E-8":[null,null,null,null,null,5450,5690,5840,6018,6212,6562,6739,7040,7208,7619,7772,7772,7772,7772],
    "E-9":[null,null,null,null,null,null,6657,6808,6998,7221,7448,7809,8115,8436,8928,9374,9843,10336,10336],
    "W-1":[3908,4329,4442,4681,4964,5381,5575,5847,6114,6324,6519,6754,6754,6754,6754,6754,6754,6754,6754],
    "W-2":[4453,4874,5003,5092,5381,5830,6053,6271,6539,6749,6937,7163,7313,7431,7431,7431,7431,7431,7431],
    "W-3":[5032,5242,5457,5528,5752,6196,6658,6875,7127,7385,7851,8165,8353,8552,8825,8825,8825,8825,8825],
    "W-4":[5510,5927,6097,6265,6553,6838,7127,7561,7942,8305,8602,8891,9315,9665,10062,10264,10264,10264,10264],
    "W-5":[null,null,null,null,null,null,null,null,null,null,null,9798,10294,10664,11074,11629,12210,12821,12821],
    "O-1":[3999,4162,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031],
    "O-2":[4607,5247,6043,6247,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376],
    "O-3":[5332,6044,6523,7113,7454,7827,8070,8467,8675,8675,8675,8675,8675,8675,8675,8675,8675,8675,8675],
    "O-4":[6064,7020,7488,7592,8027,8494,9075,9526,9840,10020,10125,10125,10125,10125,10125,10125,10125,10125,10125],
    "O-5":[7028,7918,8465,8569,8911,9115,9565,9896,10323,10975,11285,11592,11941,11941,11941,11941,11941,11941,11941],
    "O-6":[8431,9262,9870,9870,9908,10333,10389,10389,10979,12023,12635,13248,13597,13950,14633,14926,14926,14926,14926],
    "O-7":[11118,11634,11873,12063,12407,12747,13140,13532,13925,15160,16202,16202,16202,16202,16285,16611,16611,16611,16611],
    "O-8":[13380,13818,14109,14191,14554,15160,15301,15877,16042,16538,17256,17917,18360,18360,18360,18808,18808,18808,18808],
    "O-9":[null,null,null,null,null,null,null,null,null,null,null,18808,18808,18808,18808,18808,18808,18808,18808],
    "O-10":[null,null,null,null,null,null,null,null,null,null,null,18808,18808,18808,18808,18808,18808,18808,18808],
  },
  2026: {
    "E-1":[2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407],
    "E-2":[2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698],
    "E-3":[2837,3015,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198],
    "E-4":[3142,3303,3482,3659,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815],
    "E-5":[3343,3598,3776,3947,4110,4300,4395,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422],
    "E-6":[3401,3743,3908,4068,4236,4612,4760,5044,5131,5194,5268,5268,5268,5268,5268,5268,5268,5268,5268],
    "E-7":[3932,4291,4456,4673,4844,5135,5300,5592,5835,6001,6177,6245,6475,6598,7067,7067,7067,7067,7067],
    "E-8":[null,null,null,null,null,5657,5907,6062,6247,6448,6811,6995,7308,7482,7909,8068,8068,8068,8068],
    "E-9":[null,null,null,null,null,null,6910,7067,7264,7496,7731,8105,8423,8756,9268,9730,10217,10729,10729],
    "W-1":[4057,4494,4611,4859,5152,5585,5786,6069,6346,6565,6766,7010,7010,7010,7010,7010,7010,7010,7010],
    "W-2":[4622,5059,5194,5286,5586,6052,6282,6509,6787,7005,7201,7437,7592,7714,7714,7714,7714,7714,7714],
    "W-3":[5223,5441,5664,5738,5971,6431,6910,7136,7398,7666,8150,8477,8672,8879,9162,9162,9162,9162,9162],
    "W-4":[5720,6152,6329,6503,6802,7098,7398,7848,8244,8620,8928,9228,9669,10032,10445,10654,10654,10654,10654],
    "W-5":[null,null,null,null,null,null,null,null,null,null,null,10170,10686,11070,11495,12071,12673,13308,13308],
    "O-1":[4150,4320,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222],
    "O-2":[4782,5446,6272,6484,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618],
    "O-3":[5535,6273,6771,7383,7737,8125,8376,8788,9004,9004,9004,9004,9004,9004,9004,9004,9004,9004,9004],
    "O-4":[6294,7286,7773,7881,8332,8816,9419,9888,10214,10402,10510,10510,10510,10510,10510,10510,10510,10510,10510],
    "O-5":[7295,8219,8787,8894,9250,9462,9929,10272,10714,11392,11714,12033,12394,12394,12394,12394,12394,12394,12394],
    "O-6":[8751,9614,10245,10245,10284,10725,10784,10784,11396,12480,13115,13751,14113,14479,15189,15258,15258,15258,15258],
    "O-7":[11540,12076,12325,12522,12879,13232,13639,14046,14454,15736,16818,16818,16818,16818,16904,17242,17242,17242,17242],
    "O-8":[13888,14344,14645,14730,15107,15736,15882,16480,16652,17166,18598,18598,18999,18999,18999,18999,18999,18999,18999],
    "O-9":[null,null,null,null,null,null,null,null,null,null,null,18999,18999,18999,18999,18999,18999,18999,18999],
    "O-10":[null,null,null,null,null,null,null,null,null,null,null,18999,18999,18999,18999,18999,18999,18999,18999],
  },
};

function getPayTableForDate(dateStr) {
  const year = new Date(dateStr).getFullYear();
  return PAY_TABLES[Math.max(2023, Math.min(PAY_TABLE_YEAR, year))];
}

const ALL_GRADES = ["E-1","E-2","E-3","E-4","E-5","E-6","E-7","E-8","E-9","W-1","W-2","W-3","W-4","W-5","O-1","O-2","O-3","O-4","O-5","O-6","O-7","O-8","O-9","O-10"];

function getBasicPay(grade, yos, dateStr) {
  const table = getPayTableForDate(dateStr || new Date().toISOString().slice(0,10));
  const arr = table[grade];
  if (!arr) return 0;
  let idx = 0;
  for (let i = 0; i < YOS_BRACKETS.length; i++) { if (yos >= YOS_BRACKETS[i]) idx = i; else break; }
  return arr[idx] ?? 0;
}

function detectRetirementSystem(pebdStr) {
  if (!pebdStr) return "HIGH_3";
  const pebd = new Date(pebdStr);
  if (pebd < new Date("1980-09-08")) return "FINAL_PAY";
  if (pebd >= new Date("2018-01-01")) return "BRS";
  return "HIGH_3";
}

function calcADMonths(adbdStr, retDateStr) {
  const s = new Date(adbdStr), e = new Date(retDateStr);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

function calcHigh3(retDateStr, grade, promotionDateStr, prevGrade, pebdStr, annualRaiseRate=0, useProjectedRaise=false) {
  const retDate = new Date(retDateStr);
  const promDate = promotionDateStr ? new Date(promotionDateStr) : null;
  const pebd = new Date(pebdStr);
  let total = 0; const months = [];
  for (let i = 35; i >= 0; i--) {
    const d = new Date(retDate); d.setMonth(d.getMonth() - i);
    const dStr = d.toISOString().slice(0,10), dYear = d.getFullYear();
    const g = (promDate && d < promDate && prevGrade) ? prevGrade : grade;
    const yosMonths = (d.getFullYear()-pebd.getFullYear())*12+(d.getMonth()-pebd.getMonth());
    const yos = yosMonths/12;
    const basePay = getBasicPay(g, yos, dStr);
    const tableYear = Math.max(2023, Math.min(PAY_TABLE_YEAR, dYear));
    const yearsAhead = Math.max(0, dYear - PAY_TABLE_YEAR);
    const projected = useProjectedRaise && yearsAhead > 0;
    const raiseFactor = projected ? Math.pow(1+annualRaiseRate, yearsAhead) : 1;
    const pay = Math.round(basePay * raiseFactor);
    total += pay;
    months.push({ date: d.toLocaleDateString("en-US",{year:"numeric",month:"short"}), grade:g, yos:yos.toFixed(1), pay, tableYear, projected, yearsAhead, raiseFactor });
  }
  return { avg: total/36, months };
}

function calcFinalPay(retDateStr, grade, pebdStr, annualRaiseRate=0, useProjectedRaise=false) {
  const retDate = new Date(retDateStr), pebd = new Date(pebdStr);
  const yosMonths = (retDate.getFullYear()-pebd.getFullYear())*12+(retDate.getMonth()-pebd.getMonth());
  const basePay = getBasicPay(grade, yosMonths/12, retDateStr);
  const yearsAhead = Math.max(0, retDate.getFullYear()-PAY_TABLE_YEAR);
  const raiseFactor = (useProjectedRaise && yearsAhead>0) ? Math.pow(1+annualRaiseRate, yearsAhead) : 1;
  return Math.round(basePay * raiseFactor);
}

function calcRetirement({ retDateStr, adbdStr, pebdStr, iadPoints, grade, promotionDateStr, prevGrade, retSys, annualRaiseRate, useProjectedRaise }) {
  const adMonths = calcADMonths(adbdStr, retDateStr);
  const adYears = adMonths/12;
  const qualifiesFor1405 = adYears >= 20;
  const iadYears = qualifiesFor1405 ? iadPoints/360 : 0;
  const total1405Years = adYears + iadYears;
  const multiplier = retSys==="BRS" ? Math.min(total1405Years*0.02,0.60) : Math.min(total1405Years*0.025,0.75);
  let retiredPayBase, high3Months;
  if (retSys==="FINAL_PAY") {
    retiredPayBase = calcFinalPay(retDateStr, grade, pebdStr, annualRaiseRate, useProjectedRaise);
    high3Months = [];
  } else {
    const h3 = calcHigh3(retDateStr, grade, promotionDateStr, prevGrade, pebdStr, annualRaiseRate, useProjectedRaise);
    retiredPayBase = h3.avg; high3Months = h3.months;
  }
  return { retDateStr, adMonths, adYears, qualifiesFor1405, iadYears, total1405Years, multiplier, retiredPayBase, high3Months, monthlyPay: retiredPayBase*multiplier };
}

// Tax tables — IRS Rev. Proc. 2025-32 (Tax Year 2026)
const TAX_TABLE_YEAR = 2026;
const STANDARD_DEDUCTIONS = { SINGLE:16100, MFJ:32200, MFS:16100, HOH:24150 };
const TAX_BRACKETS = {
  SINGLE:[[12400,0.10],[50400,0.12],[105700,0.22],[201775,0.24],[256225,0.32],[640600,0.35],[Infinity,0.37]],
  MFJ:[[24800,0.10],[100800,0.12],[211400,0.22],[403550,0.24],[512450,0.32],[768700,0.35],[Infinity,0.37]],
  MFS:[[12400,0.10],[50400,0.12],[105700,0.22],[201775,0.24],[256225,0.32],[384350,0.35],[Infinity,0.37]],
  HOH:[[17450,0.10],[66600,0.12],[106150,0.22],[202650,0.24],[257250,0.32],[643750,0.35],[Infinity,0.37]],
};
const FILING_STATUS_LABELS = { SINGLE:"Single", MFJ:"Married Filing Jointly", MFS:"Married Filing Separately", HOH:"Head of Household" };

function calcTax(annualGross, filingStatus, stateTaxRate) {
  const stdDed = STANDARD_DEDUCTIONS[filingStatus] ?? STANDARD_DEDUCTIONS.SINGLE;
  const taxableIncome = Math.max(0, annualGross - stdDed);
  const brackets = TAX_BRACKETS[filingStatus] ?? TAX_BRACKETS.SINGLE;
  let tax=0, prev=0;
  for (const [cap,rate] of brackets) { if (taxableIncome<=prev) break; tax+=(Math.min(taxableIncome,cap)-prev)*rate; prev=cap; }
  const stateTax = taxableIncome * stateTaxRate;
  const totalTax = tax + stateTax;
  const netAnnual = annualGross - totalTax;
  return { annualGross, standardDeduction:stdDed, taxableIncome, federalTax:tax, stateTax, totalTax, netAnnual, netMonthly:netAnnual/12,
    effectiveFedRate: annualGross>0?tax/annualGross:0, effectiveTotalRate: annualGross>0?totalTax/annualGross:0 };
}

// VA Disability Rates 2026 — VA.gov — Veteran alone, no dependents — 38 U.S.C. § 1114
const VA_RATE_YEAR = 2026, VA_COLA_PCT = 2.8;
const VA_DISABILITY_RATES = { 0:0, 10:180.42, 20:356.66, 30:552.47, 40:795.84, 50:1132.90, 60:1435.02, 70:1808.45, 80:2102.15, 90:2362.30, 100:3938.58 };

const fmt$ = (n) => n.toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const fmtPct = (n) => (n*100).toFixed(2)+"%";
const fmtYrs = (n) => { const y=Math.floor(n),m=Math.round((n-y)*12); return `${y}y ${m}m`; };
const SYSTEM_LABELS = { FINAL_PAY:"Final Pay (pre-Sep 8 1980)", HIGH_3:"High-36 (§ 1407)", BRS:"Blended Retirement (BRS)" };
const SYSTEM_AUTHORITIES = { FINAL_PAY:"10 U.S.C. § 1406(c)", HIGH_3:"10 U.S.C. § 1407", BRS:"10 U.S.C. § 1409(b)(2); FY2016 NDAA" };

export default function RetirementCalculator() {
  const today = new Date();
  const [pebd,setPebd]=useState("1999-06-01");
  const [adbd,setAdbd]=useState("2004-11-25");
  const [iadPoints,setIadPoints]=useState(355);
  const [grade,setGrade]=useState("O-6");
  const [promotionDate,setPromotionDate]=useState("2025-10-01");
  const [prevGrade,setPrevGrade]=useState("O-5");
  const [retSysOverride,setRetSysOverride]=useState("");
  const [selectedRow,setSelectedRow]=useState(null);
  const [activeTab,setActiveTab]=useState("table");
  const [useProjectedRaise,setUseProjectedRaise]=useState(false);
  const [annualRaiseRate,setAnnualRaiseRate]=useState(2.0);
  const [filingStatus,setFilingStatus]=useState("SINGLE");
  const [stateTaxRate,setStateTaxRate]=useState(0.0);
  const [vaEnabled,setVaEnabled]=useState(false);
  const [vaRating,setVaRating]=useState(70);
  const [customMonth,setCustomMonth]=useState(3); // April (0-indexed)
  const [customYear,setCustomYear]=useState(2028);

  const autoRetSys = useMemo(()=>detectRetirementSystem(pebd),[pebd]);
  const retSys = retSysOverride || autoRetSys;

  const fullGradeHigh3Index = useMemo(()=>{
    if (!promotionDate||!prevGrade) return null;
    const fullDate = new Date(promotionDate); fullDate.setMonth(fullDate.getMonth()+36);
    for (let m=0;m<60;m++) { const rd=new Date(today.getFullYear(),today.getMonth()+m,1); if(rd>=fullDate) return m; }
    return null;
  },[promotionDate,prevGrade]);

  const projections = useMemo(()=>{
    if(!pebd||!adbd) return [];
    return Array.from({length:60},(_,m)=>{
      const retDate = new Date(today.getFullYear(),today.getMonth()+m,1);
      const retDateStr = retDate.toISOString().slice(0,10);
      return {...calcRetirement({retDateStr,adbdStr:adbd,pebdStr:pebd,iadPoints:Number(iadPoints),grade,promotionDateStr:promotionDate,prevGrade,retSys,annualRaiseRate:annualRaiseRate/100,useProjectedRaise}),monthOffset:m};
    });
  },[pebd,adbd,iadPoints,grade,promotionDate,prevGrade,retSys,annualRaiseRate,useProjectedRaise]);

  const chartData = projections.map(r=>({name:new Date(r.retDateStr).toLocaleDateString("en-US",{month:"short",year:"2-digit"}),pay:Math.round(r.monthlyPay)}));
  const sel = selectedRow!=null ? projections[selectedRow] : null;
  const customRowIndex = useMemo(()=>projections.findIndex(r=>{const d=new Date(r.retDateStr);return d.getFullYear()===customYear&&d.getMonth()===customMonth;}),[projections,customMonth,customYear]);
  const customRow = customRowIndex>=0 ? projections[customRowIndex] : null;
  const projectionYears = useMemo(()=>[...new Set(projections.map(r=>new Date(r.retDateStr).getFullYear()))].sort(),[projections]);
  const MONTH_NAMES=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const now0=projections[0],now12=projections[11],now24=projections[23],now36=projections[35];

  const S={
    root:{fontFamily:"'Courier New',Courier,monospace",background:"#0b0f1a",minHeight:"100vh",color:"#c8d0e0",padding:"20px",fontSize:"13px"},
    section:{background:"#111827",border:"1px solid #1e2d45",borderRadius:"4px",padding:"16px",marginBottom:"16px"},
    sectionTitle:{color:"#f0c040",fontSize:"11px",fontWeight:"bold",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"12px",borderBottom:"1px solid #1e2d45",paddingBottom:"6px"},
    grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"10px"},
    label:{display:"block",color:"#7a8a9e",fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"3px"},
    input:{width:"100%",background:"#0d1520",border:"1px solid #2a3a50",borderRadius:"3px",color:"#e0e8f0",padding:"5px 7px",fontSize:"12px",fontFamily:"inherit",boxSizing:"border-box",outline:"none"},
    select:{width:"100%",background:"#0d1520",border:"1px solid #2a3a50",borderRadius:"3px",color:"#e0e8f0",padding:"5px 7px",fontSize:"12px",fontFamily:"inherit",boxSizing:"border-box",outline:"none"},
    stat:{background:"#0d1520",border:"1px solid #1e2d45",borderRadius:"3px",padding:"10px 12px",textAlign:"center"},
    table:{width:"100%",borderCollapse:"collapse",fontSize:"11px"},
    th:{background:"#0d1520",color:"#c8a84b",padding:"6px 8px",textAlign:"right",borderBottom:"2px solid #1e2d45",fontSize:"9px",letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"},
    thL:{background:"#0d1520",color:"#c8a84b",padding:"6px 8px",textAlign:"left",borderBottom:"2px solid #1e2d45",fontSize:"9px",letterSpacing:"0.06em",textTransform:"uppercase"},
    td:{padding:"5px 8px",textAlign:"right",borderBottom:"1px solid #111827",color:"#c8d0e0"},
    tdL:{padding:"5px 8px",textAlign:"left",borderBottom:"1px solid #111827",color:"#c8d0e0"},
    tab:(a)=>({padding:"5px 12px",fontSize:"10px",letterSpacing:"0.08em",textTransform:"uppercase",border:"1px solid #c8a84b",borderRadius:"2px",cursor:"pointer",fontFamily:"inherit",background:a?"#c8a84b":"#0d1520",color:a?"#0b0f1a":"#c8a84b",fontWeight:a?"bold":"normal"}),
    cite:{color:"#4a6080",fontSize:"9px",fontStyle:"italic"},
    brow:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid #1e2d45",padding:"7px 0"},
    blabel:{color:"#7a8a9e",fontSize:"11px",flex:1},
    bval:{color:"#f0c040",fontSize:"12px",fontWeight:"bold",fontFamily:"monospace",marginLeft:"14px"},
    bcite:{color:"#2a4060",fontSize:"9px",marginTop:"2px"},
  };

  return (
    <div style={S.root}>
      <div style={{borderBottom:"2px solid #c8a84b",paddingBottom:"10px",marginBottom:"20px"}}>
        <p style={{fontSize:"20px",fontWeight:"bold",color:"#f0c040",letterSpacing:"0.1em",textTransform:"uppercase",margin:0}}>
          Military Retirement Pay Calculator
          <span style={{display:"inline-block",background:"#1a2233",border:"1px solid #c8a84b",color:"#c8a84b",padding:"2px 8px",fontSize:"10px",borderRadius:"2px",marginLeft:"10px",verticalAlign:"middle"}}>{PAY_TABLE_YEAR} PAY TABLE</span>
        </p>
        <p style={{color:"#7a8a9e",fontSize:"11px",marginTop:"4px"}}>§ 1405 / § 1407 / § 1409 · IAD Points · Historical Pay Tables 2023–2026 · Tax Year {TAX_TABLE_YEAR} · VA {VA_RATE_YEAR}</p>
      </div>

      {/* INPUTS */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Service Data Inputs</div>
        <div style={S.grid}>
          <div><label style={S.label}>PEBD / DIEMS</label><input style={S.input} type="date" value={pebd} onChange={e=>setPebd(e.target.value)}/></div>
          <div><label style={S.label}>Active Duty Base Date (ADBD)</label><input style={S.input} type="date" value={adbd} onChange={e=>setAdbd(e.target.value)}/></div>
          <div><label style={S.label}>IAD / Reserve Points</label><input style={S.input} type="number" min="0" value={iadPoints} onChange={e=>setIadPoints(e.target.value)}/></div>
          <div><label style={S.label}>Grade / Rank</label><select style={S.select} value={grade} onChange={e=>setGrade(e.target.value)}>{ALL_GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
          <div><label style={S.label}>Promotion Date (current grade)</label><input style={S.input} type="date" value={promotionDate} onChange={e=>setPromotionDate(e.target.value)}/></div>
          <div><label style={S.label}>Previous Grade</label><select style={S.select} value={prevGrade} onChange={e=>setPrevGrade(e.target.value)}><option value="">— N/A —</option>{ALL_GRADES.map(g=><option key={g}>{g}</option>)}</select></div>
          <div><label style={S.label}>Retirement System</label>
            <select style={S.select} value={retSysOverride} onChange={e=>setRetSysOverride(e.target.value)}>
              <option value="">Auto ({SYSTEM_LABELS[autoRetSys]})</option>
              <option value="FINAL_PAY">Final Pay</option><option value="HIGH_3">High-36</option><option value="BRS">BRS</option>
            </select>
          </div>
          <div><label style={S.label}>Projected Annual Raise
            <span style={{display:"block",...S.cite}}>Applied to months beyond {PAY_TABLE_YEAR}</span>
          </label>
            <div style={{display:"flex",gap:"6px",alignItems:"center"}}>
              <button onClick={()=>setUseProjectedRaise(v=>!v)} style={{padding:"4px 10px",background:useProjectedRaise?"#1a4a2a":"#0d1520",border:`1px solid ${useProjectedRaise?"#40c080":"#2a3a50"}`,color:useProjectedRaise?"#40c080":"#4a6080",borderRadius:"3px",cursor:"pointer",fontFamily:"inherit",fontSize:"10px",fontWeight:"bold",whiteSpace:"nowrap"}}>
                {useProjectedRaise?"● ON":"○ OFF"}
              </button>
              <div style={{position:"relative",flex:1}}>
                <input style={{...S.input,paddingRight:"22px",opacity:useProjectedRaise?1:0.4}} type="number" min="0" max="20" step="0.1" value={annualRaiseRate} onChange={e=>setAnnualRaiseRate(parseFloat(e.target.value)||0)} disabled={!useProjectedRaise}/>
                <span style={{position:"absolute",right:"6px",top:"50%",transform:"translateY(-50%)",color:"#4a6080",fontSize:"11px",pointerEvents:"none"}}>%</span>
              </div>
            </div>
          </div>
          <div><label style={S.label}>Filing Status</label>
            <select style={S.select} value={filingStatus} onChange={e=>setFilingStatus(e.target.value)}>
              {Object.entries(FILING_STATUS_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div><label style={S.label}>State Tax Rate</label>
            <div style={{position:"relative"}}>
              <input style={{...S.input,paddingRight:"22px"}} type="number" min="0" max="20" step="0.1" value={stateTaxRate} onChange={e=>setStateTaxRate(parseFloat(e.target.value)||0)}/>
              <span style={{position:"absolute",right:"6px",top:"50%",transform:"translateY(-50%)",color:"#4a6080",fontSize:"11px",pointerEvents:"none"}}>%</span>
            </div>
          </div>
        </div>
        <div style={{marginTop:"10px",background:"#1a1000",border:"1px solid #c8a84b",borderRadius:"3px",padding:"8px 12px",color:"#c8a84b",fontSize:"10px"}}>
          <strong>System:</strong> {SYSTEM_LABELS[retSys]} · {SYSTEM_AUTHORITIES[retSys]}
          {useProjectedRaise && <span style={{marginLeft:"12px",color:"#40c080"}}>▲ {annualRaiseRate}%/yr projected</span>}
        </div>
      </div>

      {/* SNAPSHOT */}
      {projections.length>0 && now0 && (
        <div style={S.section}>
          <div style={S.sectionTitle}>Snapshot — Est. Monthly Retirement Pay</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:"8px"}}>

            {/* 1 — Custom Date */}
            <div style={{...S.stat,border:"2px solid #6080c8",background:"#0a1020"}}>
              <div style={{color:"#6080c8",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"5px"}}>Custom Date</div>
              <div style={{display:"flex",gap:"3px",marginBottom:"6px"}}>
                <select value={customMonth} onChange={e=>setCustomMonth(Number(e.target.value))} style={{flex:1,background:"#0d1520",border:"1px solid #2a3a60",color:"#c0c8e0",borderRadius:"3px",padding:"3px 2px",fontSize:"10px",fontFamily:"inherit",outline:"none"}}>
                  {MONTH_NAMES.map((m,i)=><option key={i} value={i}>{m}</option>)}
                </select>
                <select value={customYear} onChange={e=>setCustomYear(Number(e.target.value))} style={{flex:1,background:"#0d1520",border:"1px solid #2a3a60",color:"#c0c8e0",borderRadius:"3px",padding:"3px 2px",fontSize:"10px",fontFamily:"inherit",outline:"none"}}>
                  {projectionYears.map(y=><option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {customRow ? (()=>{
                const tx=calcTax(customRow.monthlyPay*12,filingStatus,stateTaxRate/100);
                return (<>
                  <div style={{color:"#8098e0",fontSize:"16px",fontWeight:"bold"}}>{fmt$(customRow.monthlyPay)}</div>
                  <div style={{color:"#4a6080",fontSize:"9px",marginTop:"1px"}}>{fmt$(customRow.monthlyPay*12)}/yr gross</div>
                  <div style={{color:"#50c090",fontSize:"12px",fontWeight:"bold",marginTop:"4px",borderTop:"1px solid #1a2060",paddingTop:"4px"}}>{fmt$(tx.netMonthly)}/mo net</div>
                  <div style={{color:"#3a8060",fontSize:"9px"}}>{fmt$(tx.netAnnual)}/yr net</div>
                  <div style={{color:"#3a5090",fontSize:"9px",marginTop:"2px"}}>{fmtPct(customRow.multiplier)} · {new Date(customRow.retDateStr).toLocaleDateString("en-US",{month:"short",year:"numeric"})}</div>
                </>);
              })() : <div style={{color:"#4a5070",fontSize:"10px"}}>Outside window</div>}
            </div>

            {/* 2 — VA Disability */}
            <div style={{...S.stat,border:`2px solid ${vaEnabled?"#c8502a":"#2a3a50"}`,background:vaEnabled?"#160a04":"#0d1520"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"5px"}}>
                <div style={{color:vaEnabled?"#e06030":"#4a6080",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.08em"}}>VA Disability</div>
                <button onClick={()=>setVaEnabled(v=>!v)} style={{padding:"2px 7px",fontSize:"9px",fontFamily:"inherit",background:vaEnabled?"#3a1a08":"#0d1520",border:`1px solid ${vaEnabled?"#c8502a":"#2a3a50"}`,color:vaEnabled?"#e06030":"#4a6080",borderRadius:"2px",cursor:"pointer",fontWeight:"bold"}}>
                  {vaEnabled?"● ON":"○ OFF"}
                </button>
              </div>
              <select value={vaRating} onChange={e=>setVaRating(Number(e.target.value))} style={{width:"100%",background:"#0d1520",border:`1px solid ${vaEnabled?"#6a2a10":"#2a3a50"}`,color:vaEnabled?"#e09070":"#4a6080",borderRadius:"3px",padding:"3px 5px",fontSize:"10px",fontFamily:"inherit",marginBottom:"6px",outline:"none",opacity:vaEnabled?1:0.5}}>
                {[0,10,20,30,40,50,60,70,80,90,100].map(r=><option key={r} value={r}>{r}% — {r===0?"No VA pay":fmt$(VA_DISABILITY_RATES[r])+"/mo"}</option>)}
              </select>
              {vaEnabled && vaRating>0 ? (()=>{
                const vaM=VA_DISABILITY_RATES[vaRating];
                const tx=now0?calcTax(now0.monthlyPay*12,filingStatus,stateTaxRate/100):null;
                return (<>
                  <div style={{color:"#e06030",fontSize:"16px",fontWeight:"bold"}}>{fmt$(vaM)}<span style={{fontSize:"9px",color:"#6a3010"}}>/mo</span></div>
                  <div style={{color:"#6a3010",fontSize:"9px",marginTop:"1px"}}>{fmt$(vaM*12)}/yr · 100% tax-free</div>
                  {tx&&<div style={{marginTop:"5px",borderTop:"1px solid #3a1a08",paddingTop:"5px"}}>
                    <div style={{color:"#4a6080",fontSize:"9px"}}>Combined net (today)</div>
                    <div style={{color:"#f0a060",fontSize:"13px",fontWeight:"bold"}}>{fmt$(tx.netMonthly+vaM)}/mo</div>
                    <div style={{color:"#806030",fontSize:"9px"}}>{fmt$((tx.netMonthly+vaM)*12)}/yr</div>
                  </div>}
                  <div style={{color:"#3a2010",fontSize:"8px",marginTop:"3px"}}>{VA_RATE_YEAR} · {VA_COLA_PCT}% COLA · § 1114</div>
                </>);
              })() : <div style={{color:"#3a4050",fontSize:"10px"}}>{vaEnabled?"Select rating > 0%":"Enable to add VA pay"}</div>}
            </div>

            {/* 3 — Full Grade High-3 */}
            {(()=>{
              const row=fullGradeHigh3Index!=null?projections[fullGradeHigh3Index]:null;
              const tx=row?calcTax(row.monthlyPay*12,filingStatus,stateTaxRate/100):null;
              return (
                <div style={{...S.stat,border:"2px solid #40c080",background:"#0a1f14"}}>
                  <div style={{color:"#40c080",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"3px"}}>★ Full {grade} High-3</div>
                  <div style={{color:"#2a7050",fontSize:"8px",marginBottom:"5px"}}>All 36 lookback months @ {grade} pay · § 1407</div>
                  {row&&tx ? <>
                    <div style={{color:"#40c080",fontSize:"16px",fontWeight:"bold"}}>{fmt$(row.monthlyPay)}</div>
                    <div style={{color:"#2a6040",fontSize:"9px",marginTop:"1px"}}>{fmt$(row.monthlyPay*12)}/yr gross</div>
                    <div style={{color:"#50d090",fontSize:"12px",fontWeight:"bold",marginTop:"4px",borderTop:"1px solid #1a4030",paddingTop:"4px"}}>{fmt$(tx.netMonthly)}/mo net</div>
                    <div style={{color:"#3a8060",fontSize:"9px"}}>{fmt$(tx.netAnnual)}/yr net</div>
                    <div style={{color:"#2a5040",fontSize:"9px",marginTop:"2px"}}>{new Date(row.retDateStr).toLocaleDateString("en-US",{month:"short",year:"numeric"})} · {fmtPct(row.multiplier)}</div>
                  </> : <div style={{color:"#2a5040",fontSize:"10px"}}>Outside 60-month window</div>}
                </div>
              );
            })()}

            {/* 4–7 — Projection cards: Today, +12, +24, +36 */}
            {[
              {label:"If Retiring Today", row:now0},
              {label:"+ 12 Months",       row:now12},
              {label:"+ 24 Months",       row:now24},
              {label:"+ 36 Months",       row:now36},
            ].map(({label,row})=>{
              const tx=row?calcTax(row.monthlyPay*12,filingStatus,stateTaxRate/100):null;
              return (
                <div key={label} style={S.stat}>
                  <div style={{color:"#7a8a9e",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                  {row&&tx ? <>
                    <div style={{color:"#f0c040",fontSize:"16px",fontWeight:"bold",marginTop:"3px"}}>{fmt$(row.monthlyPay)}</div>
                    <div style={{color:"#4a6040",fontSize:"9px",marginTop:"1px"}}>{fmt$(row.monthlyPay*12)}/yr gross</div>
                    <div style={{color:"#60c080",fontSize:"12px",fontWeight:"bold",marginTop:"4px",borderTop:"1px solid #1a2030",paddingTop:"4px"}}>{fmt$(tx.netMonthly)}/mo net</div>
                    <div style={{color:"#3a8060",fontSize:"9px"}}>{fmt$(tx.netAnnual)}/yr net</div>
                    <div style={{color:"#4a6080",fontSize:"9px",marginTop:"2px"}}>{fmtPct(row.multiplier)} × {fmt$(row.retiredPayBase)}</div>
                  </> : <div style={{color:"#4a5070",fontSize:"10px",marginTop:"6px"}}>—</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={{display:"flex",gap:"4px",marginBottom:"14px",flexWrap:"wrap"}}>
        {[["table","Projection"],["tax","Tax & Net Pay"],["chart","Pay Chart"],["refs","Reg. Refs"],["update","Update Tables"]].map(([id,lbl])=>(
          <button key={id} style={S.tab(activeTab===id)} onClick={()=>setActiveTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* PROJECTION TABLE */}
      {activeTab==="table" && (
        <div style={S.section}>
          <div style={S.sectionTitle}>60-Month Projection · Click row for breakdown</div>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.thL}>Ret. Date</th>
                <th style={S.th}>AD Svc<br/><span style={S.cite}>§1405(a)(1-2)</span></th>
                <th style={S.th}>IAD Yrs<br/><span style={S.cite}>§1405(a)(3)</span></th>
                <th style={S.th}>Total §1405</th>
                <th style={S.th}>Multiplier<br/><span style={S.cite}>§1409</span></th>
                <th style={S.th}>Pay Base<br/><span style={S.cite}>§1407</span></th>
                <th style={S.th}>Monthly Pay</th>
                <th style={S.th}>Annual Pay</th>
              </tr></thead>
              <tbody>{projections.map((r,i)=>{
                const isSel=selectedRow===i, isPast=new Date(r.retDateStr)<today;
                const isH3=i===fullGradeHigh3Index, isCust=i===customRowIndex;
                const bg=isSel?"#1a2a0a":isH3?"#0a2218":isCust?"#0a1228":i%2===0?"#0f1622":"#111827";
                const bl=isH3?"3px solid #40c080":isCust?"3px solid #6080c8":isSel?"3px solid #c8a84b":"3px solid transparent";
                return (<tr key={i} style={{background:bg,cursor:"pointer",opacity:isPast?0.6:1,borderLeft:bl}} onClick={()=>setSelectedRow(isSel?null:i)}>
                  <td style={{...S.tdL,color:isPast?"#4a6080":isH3?"#40c080":isCust?"#8098e0":"#e0e8f0",whiteSpace:"nowrap"}}>
                    {new Date(r.retDateStr).toLocaleDateString("en-US",{year:"numeric",month:"short"})}
                    {isPast&&<span style={{color:"#c8a84b",marginLeft:4,fontSize:"9px"}}>PAST</span>}
                    {isH3&&<span style={{color:"#40c080",marginLeft:4,fontSize:"9px",background:"#0d3020",border:"1px solid #40c080",padding:"0 4px",borderRadius:"2px"}}>★H3</span>}
                    {isCust&&!isH3&&<span style={{color:"#8098e0",marginLeft:4,fontSize:"9px",background:"#0d1535",border:"1px solid #6080c8",padding:"0 4px",borderRadius:"2px"}}>◆</span>}
                  </td>
                  <td style={S.td}>{fmtYrs(r.adYears)}</td>
                  <td style={{...S.td,color:r.qualifiesFor1405?"#80c080":"#4a6080"}}>{r.qualifiesFor1405?fmtYrs(r.iadYears):"—"}</td>
                  <td style={{...S.td,fontWeight:"bold"}}>{fmtYrs(r.total1405Years)}</td>
                  <td style={{...S.td,color:"#f0c040"}}>{fmtPct(r.multiplier)}</td>
                  <td style={{...S.td,color:isH3?"#40c080":undefined}}>{fmt$(r.retiredPayBase)}</td>
                  <td style={{...S.td,color:"#f0c040",fontSize:"13px",fontWeight:"bold"}}>{fmt$(r.monthlyPay)}</td>
                  <td style={{...S.td,color:"#80c080"}}>{fmt$(r.monthlyPay*12)}</td>
                </tr>);
              })}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* BREAKDOWN PANEL */}
      {selectedRow!=null&&sel&&activeTab==="table"&&(
        <div style={{...S.section,border:"1px solid #c8a84b"}}>
          <button style={{background:"none",border:"1px solid #c8a84b",color:"#c8a84b",padding:"3px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:"10px",borderRadius:"2px",float:"right"}} onClick={()=>setSelectedRow(null)}>✕ Close</button>
          <div style={S.sectionTitle}>Breakdown — {new Date(sel.retDateStr).toLocaleDateString("en-US",{year:"numeric",month:"long"})}</div>
          {[
            {label:"Active Duty Service",val:`${sel.adMonths} mo → ${fmtYrs(sel.adYears)}`,cite:"10 U.S.C. § 1405(a)(1)–(a)(2); § 1405(b)"},
            {label:`IAD Credit Qualifies? (≥20 AD yrs)`,val:sel.qualifiesFor1405?"YES":"NO",cite:"10 U.S.C. § 1405(a)(3); § 12733",color:sel.qualifiesFor1405?"#80c080":"#c04040"},
            {label:`IAD Points (${iadPoints} ÷ 360)`,val:sel.qualifiesFor1405?`${iadPoints} ÷ 360 = ${fmtYrs(sel.iadYears)}`:"—",cite:"10 U.S.C. § 1405(a)(3); § 12733"},
            {label:"Total § 1405 Years",val:`${fmtYrs(sel.total1405Years)} (${sel.total1405Years.toFixed(4)} yrs)`,cite:"10 U.S.C. § 1405(a)"},
            {label:`Multiplier (${retSys==="BRS"?"2.0%":"2.5%"} × § 1405 yrs)`,val:`${retSys==="BRS"?"2.0%":"2.5%"} × ${sel.total1405Years.toFixed(4)} = ${fmtPct(sel.multiplier)}`,cite:`10 U.S.C. § 1409(b)(${retSys==="BRS"?"2":"1"})`},
            {label:"Retired Pay Base",val:`${fmt$(sel.retiredPayBase)}/mo`,cite:"10 U.S.C. § 1407"},
            {label:"Gross Monthly Retirement Pay",val:`${fmt$(sel.monthlyPay)}/mo (${fmt$(sel.monthlyPay*12)}/yr)`,cite:`10 U.S.C. § 1401; ${SYSTEM_AUTHORITIES[retSys]}`,large:true},
          ].map(({label,val,cite,color,large})=>(
            <div key={label} style={S.brow}>
              <div style={S.blabel}>{label}<div style={S.bcite}>{cite}</div></div>
              <div style={{...S.bval,color:color||(large?"#f0c040":"#f0c040"),fontSize:large?"18px":"12px"}}>{val}</div>
            </div>
          ))}

          {/* High-3 table */}
          {sel.high3Months.length>0&&(
            <div style={{marginTop:"12px"}}>
              <div style={{...S.sectionTitle,fontSize:"9px"}}>High-36 Breakdown — 10 U.S.C. § 1407</div>
              <div style={{maxHeight:"180px",overflowY:"auto",overflowX:"auto"}}>
                <table style={S.table}>
                  <thead><tr><th style={S.thL}>Month</th><th style={S.th}>Pay Table</th><th style={S.th}>Grade</th><th style={S.th}>YOS</th><th style={S.th}>Basic Pay</th></tr></thead>
                  <tbody>
                    {sel.high3Months.map((m,i)=>(
                      <tr key={i} style={{background:i%2===0?"#0f1622":"#111827"}}>
                        <td style={S.tdL}>{m.date}</td>
                        <td style={{...S.td,color:m.projected?"#40c080":m.tableYear<PAY_TABLE_YEAR?"#c8a84b":"#4a9080",fontSize:"9px"}}>{m.projected?`${PAY_TABLE_YEAR}+${m.yearsAhead}yr ▲${annualRaiseRate}%`:`${m.tableYear} ${m.tableYear<PAY_TABLE_YEAR?"✓":""}`}</td>
                        <td style={{...S.td,color:"#c8a84b"}}>{m.grade}</td>
                        <td style={S.td}>{m.yos}</td>
                        <td style={{...S.td,color:m.projected?"#40c080":undefined}}>{fmt$(m.pay)}</td>
                      </tr>
                    ))}
                    <tr style={{background:"#1a2a0a"}}><td style={{...S.tdL,fontWeight:"bold",color:"#f0c040"}} colSpan={4}>36-Month Average</td><td style={{...S.td,fontWeight:"bold",color:"#f0c040"}}>{fmt$(sel.retiredPayBase)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tax breakdown */}
          {(()=>{
            const tx=calcTax(sel.monthlyPay*12,filingStatus,stateTaxRate/100);
            const vaM=(vaEnabled&&vaRating>0)?VA_DISABILITY_RATES[vaRating]:0;
            return (<div style={{marginTop:"16px",borderTop:"1px solid #1e2d45",paddingTop:"14px"}}>
              <div style={{...S.sectionTitle,fontSize:"9px",color:"#c8a84b"}}>Tax Estimate — {FILING_STATUS_LABELS[filingStatus]} · State {stateTaxRate}% · IRS {TAX_TABLE_YEAR}</div>
              {[
                {label:"Gross Annual",val:fmt$(tx.annualGross),cite:"26 U.S.C. § 61"},
                {label:`Standard Deduction (${FILING_STATUS_LABELS[filingStatus]})`,val:`− ${fmt$(tx.standardDeduction)}`,cite:"26 U.S.C. § 63(c)"},
                {label:"Federal Taxable Income",val:fmt$(tx.taxableIncome),cite:"26 U.S.C. § 63"},
                {label:`Federal Tax (${(tx.effectiveFedRate*100).toFixed(1)}% effective)`,val:`− ${fmt$(tx.federalTax)}`,cite:"26 U.S.C. § 1; IRS Rev. Proc. 2025-32",red:true},
                {label:`State Tax (${stateTaxRate}%)`,val:`− ${fmt$(tx.stateTax)}`,cite:"State law — set 0% if state exempts mil. retirement",red:true},
                {label:`Total Tax (${(tx.effectiveTotalRate*100).toFixed(1)}% of gross)`,val:`− ${fmt$(tx.totalTax)}`,cite:"Federal + state",red:true},
              ].map(({label,val,cite,red})=>(
                <div key={label} style={S.brow}>
                  <div style={S.blabel}>{label}<div style={S.bcite}>{cite}</div></div>
                  <div style={{...S.bval,color:red?"#c06060":"#c8d0e0",fontSize:"11px"}}>{val}</div>
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:vaM>0?"1fr 1fr 1fr":"1fr 1fr",gap:"8px",marginTop:"10px"}}>
                {[
                  {label:"Net Ret. Monthly",val:fmt$(tx.netMonthly),c:"#60d090"},
                  {label:"Net Ret. Annual",val:fmt$(tx.netAnnual),c:"#40a060"},
                  ...(vaM>0?[{label:`+ VA ${vaRating}% + Net/Mo`,val:fmt$(tx.netMonthly+vaM),c:"#f0a060"}]:[]),
                ].map(({label,val,c})=>(
                  <div key={label} style={{background:"#0a1520",border:"1px solid #1e4030",borderRadius:"3px",padding:"8px",textAlign:"center"}}>
                    <div style={{color:"#4a8060",fontSize:"9px",textTransform:"uppercase"}}>{label}</div>
                    <div style={{color:c,fontSize:"18px",fontWeight:"bold",marginTop:"3px"}}>{val}</div>
                  </div>
                ))}
              </div>
              {vaM>0&&<div style={{color:"#3a2010",fontSize:"9px",marginTop:"6px"}}>VA pay is 100% tax-free — 26 U.S.C. § 104(a)(4); 38 U.S.C. § 5301</div>}
            </div>);
          })()}
        </div>
      )}

      {/* TAX TAB */}
      {activeTab==="tax"&&(
        <div style={S.section}>
          <div style={S.sectionTitle}>Tax & Net Pay — {FILING_STATUS_LABELS[filingStatus]} · State {stateTaxRate}% · IRS {TAX_TABLE_YEAR}
            {vaEnabled&&vaRating>0&&<span style={{color:"#e06030",marginLeft:"8px"}}>+ VA {vaRating}%</span>}
          </div>
          <div style={{color:"#4a6080",fontSize:"9px",marginBottom:"10px"}}>26 U.S.C. § 1 · § 63(c) · § 61 · Rev. Proc. 2025-32{vaEnabled&&vaRating>0?" · 38 U.S.C. § 1114 (VA tax-free)":""} · Estimates only</div>
          <div style={{overflowX:"auto"}}>
            <table style={S.table}>
              <thead><tr>
                <th style={S.thL}>Ret. Date</th>
                <th style={S.th}>Gross Mo</th>
                <th style={S.th}>Fed Tax</th>
                <th style={S.th}>State Tax</th>
                <th style={S.th}>Eff Rate</th>
                <th style={S.th}>Net Ret/Mo</th>
                <th style={S.th}>Net Ret/Yr</th>
                {vaEnabled&&vaRating>0&&<><th style={{...S.th,color:"#e06030",borderLeft:"2px solid #3a1a08"}}>VA {vaRating}%</th><th style={{...S.th,color:"#f0a060"}}>Combined/Mo</th><th style={{...S.th,color:"#f0a060"}}>Combined/Yr</th></>}
              </tr></thead>
              <tbody>{projections.map((r,i)=>{
                const isPast=new Date(r.retDateStr)<today, isH3=i===fullGradeHigh3Index, isCust=i===customRowIndex;
                const tx=calcTax(r.monthlyPay*12,filingStatus,stateTaxRate/100);
                const vaM=(vaEnabled&&vaRating>0)?VA_DISABILITY_RATES[vaRating]:0;
                const bg=isH3?"#0a2218":isCust?"#0a1228":i%2===0?"#0f1622":"#111827";
                const bl=isH3?"3px solid #40c080":isCust?"3px solid #6080c8":"3px solid transparent";
                return (<tr key={i} style={{background:bg,opacity:isPast?0.6:1,borderLeft:bl}}>
                  <td style={{...S.tdL,color:isPast?"#4a6080":isH3?"#40c080":isCust?"#8098e0":"#e0e8f0",whiteSpace:"nowrap"}}>
                    {new Date(r.retDateStr).toLocaleDateString("en-US",{year:"numeric",month:"short"})}
                    {isH3&&<span style={{color:"#40c080",marginLeft:3,fontSize:"9px"}}>★H3</span>}
                    {isCust&&!isH3&&<span style={{color:"#8098e0",marginLeft:3,fontSize:"9px"}}>◆</span>}
                  </td>
                  <td style={S.td}>{fmt$(r.monthlyPay)}</td>
                  <td style={{...S.td,color:"#c06060"}}>−{fmt$(tx.federalTax/12)}</td>
                  <td style={{...S.td,color:"#c07050"}}>−{fmt$(tx.stateTax/12)}</td>
                  <td style={{...S.td,color:"#a05050",fontSize:"10px"}}>{(tx.effectiveTotalRate*100).toFixed(1)}%</td>
                  <td style={{...S.td,color:"#60d090",fontWeight:"bold"}}>{fmt$(tx.netMonthly)}</td>
                  <td style={{...S.td,color:"#40a060"}}>{fmt$(tx.netAnnual)}</td>
                  {vaEnabled&&vaRating>0&&<>
                    <td style={{...S.td,color:"#e06030",borderLeft:"2px solid #2a1008"}}>{fmt$(vaM)}</td>
                    <td style={{...S.td,color:"#f0a060",fontWeight:"bold"}}>{fmt$(tx.netMonthly+vaM)}</td>
                    <td style={{...S.td,color:"#c08040"}}>{fmt$((tx.netMonthly+vaM)*12)}</td>
                  </>}
                </tr>);
              })}</tbody>
            </table>
          </div>
          <div style={{color:"#2a4060",fontSize:"9px",marginTop:"8px"}}>★H3 = Full {grade} High-3 · ◆ = Custom date · Brackets per IRS Rev. Proc. 2025-32 · Does not include AMT, credits, or other income{vaEnabled&&vaRating>0?" · VA pay 100% tax-free per 38 U.S.C. § 5301":""}</div>
        </div>
      )}

      {/* CHART */}
      {activeTab==="chart"&&(
        <div style={S.section}>
          <div style={S.sectionTitle}>Monthly Retirement Pay — 60-Month Projection</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{top:8,right:20,bottom:8,left:20}}>
              <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3"/>
              <XAxis dataKey="name" tick={{fill:"#4a6080",fontSize:9}} tickLine={false} interval={5}/>
              <YAxis tickFormatter={v=>`$${(v/1000).toFixed(0)}k`} tick={{fill:"#4a6080",fontSize:9}} tickLine={false} width={45}/>
              <Tooltip contentStyle={{background:"#0d1520",border:"1px solid #c8a84b",fontFamily:"monospace",fontSize:"11px"}} labelStyle={{color:"#c8a84b"}} formatter={v=>[fmt$(v),"Monthly Pay"]}/>
              <Line type="monotone" dataKey="pay" stroke="#f0c040" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* REFS */}
      {activeTab==="refs"&&(
        <div style={S.section}>
          <div style={S.sectionTitle}>Regulatory Authority Reference</div>
          {[
            {c:"10 U.S.C. § 1405",t:"Years of service computation for retirement pay multiplier. § 1405(a)(1)-(a)(2) credits active duty; § 1405(a)(3) credits IAD/reserve points via § 12733 as if entitled under § 12731; § 1405(b) each full month = 1/12 year."},
            {c:"10 U.S.C. § 12733",t:"Converts retirement points (IDT/IAD, membership, active duty) to years of service. Referenced by § 1405(a)(3) to bring IAD points into the active duty retirement multiplier."},
            {c:"10 U.S.C. § 1407",t:"High-36 retired pay base: monthly average of basic pay for the 36 months immediately preceding retirement."},
            {c:"10 U.S.C. § 1409",t:"Retired pay multiplier: 2.5%/yr (Final Pay/High-3) or 2.0%/yr (BRS). Max 75% (non-BRS) or 60% (BRS) at 30 years."},
            {c:"37 U.S.C. § 1009",t:"Annual basic pay adjustment tied to Employment Cost Index (ECI). 2026 raise: 3.8%, confirmed by FY2026 NDAA (S.5009, Dec 18, 2025)."},
            {c:"26 U.S.C. § 1; IRS Rev. Proc. 2025-32",t:"2026 federal income tax brackets and standard deduction ($16,100 single, $32,200 MFJ, $24,150 HOH). Military retirement pay is ordinary income per 26 U.S.C. § 61; IRS Pub. 525."},
            {c:"38 U.S.C. § 1114; 26 U.S.C. § 104(a)(4); 38 U.S.C. § 5301",t:"VA disability compensation schedule and tax exemption. VA pay is 100% tax-free. 2026 rates reflect 2.8% COLA (SSA announcement Oct 24, 2025). Veteran-alone rates per VA.gov."},
          ].map(({c,t})=>(
            <div key={c} style={{borderBottom:"1px solid #1e2d45",paddingBottom:"10px",marginBottom:"10px"}}>
              <div style={{color:"#c8a84b",fontSize:"11px",fontWeight:"bold",marginBottom:"3px"}}>{c}</div>
              <div style={{color:"#8090a0",fontSize:"10px",lineHeight:"1.6"}}>{t}</div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE */}
      {activeTab==="update"&&(
        <div style={S.section}>
          <div style={S.sectionTitle}>Annual Update Guide</div>
          <div style={{color:"#8090a0",fontSize:"11px",lineHeight:"1.8"}}>
            <p style={{color:"#c8a84b"}}>DFAS Pay Tables: <span style={{color:"#e0e8f0"}}>https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/</span></p>
            <p style={{color:"#c8a84b",marginTop:"8px"}}>VA Disability Rates: <span style={{color:"#e0e8f0"}}>https://www.va.gov/disability/compensation-rates/veteran-rates/</span></p>
            <p style={{color:"#c8a84b",marginTop:"8px"}}>IRS Tax Brackets: <span style={{color:"#e0e8f0"}}>https://www.irs.gov → search "Revenue Procedure [year] inflation adjustments"</span></p>
            <ul style={{paddingLeft:"18px",marginTop:"10px"}}>
              <li>Update <code style={{color:"#c8a84b"}}>PAY_TABLE_YEAR</code> and add new year to <code style={{color:"#c8a84b"}}>PAY_TABLES</code></li>
              <li>Update <code style={{color:"#c8a84b"}}>TAX_TABLE_YEAR</code>, <code style={{color:"#c8a84b"}}>STANDARD_DEDUCTIONS</code>, and <code style={{color:"#c8a84b"}}>TAX_BRACKETS</code></li>
              <li>Update <code style={{color:"#c8a84b"}}>VA_RATE_YEAR</code>, <code style={{color:"#c8a84b"}}>VA_COLA_PCT</code>, and <code style={{color:"#c8a84b"}}>VA_DISABILITY_RATES</code></li>
            </ul>
          </div>
        </div>
      )}

      <div style={{textAlign:"center",color:"#2a4060",fontSize:"9px",marginTop:"14px"}}>
        Reference tool only · Verify with finance office, RSO, and tax professional · Cite 10 U.S.C. §§ 1405/1407/1409 · 38 U.S.C. § 1114 · IRS Rev. Proc. 2025-32
      </div>
    </div>
  );
}
