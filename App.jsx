
import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// ═══════════════════════════════════════════════════════════════════════════
// HISTORICAL MILITARY BASIC PAY TABLES — 2023 through 2026
// Source: Defense Finance and Accounting Service (DFAS)
// Official URL: https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
// Authority: 37 U.S.C. § 203 (basic pay entitlement)
//            37 U.S.C. § 1009 (annual pay adjustment — tied to ECI)
//
// Used for accurate High-36 calculation (10 U.S.C. § 1407) — each lookback
// month uses the pay table actually in effect that month, not the current year.
//
// Annual raise history:
//   2023: 4.6% — FY2023 NDAA (signed Dec 23, 2022), effective Jan 1, 2023
//   2024: 5.2% — FY2024 NDAA (signed Dec 22, 2023), effective Jan 1, 2024
//   2025: 4.5% — FY2025 NDAA (signed Dec 23, 2024), effective Jan 1, 2025
//          NOTE: E-5 and below received additional raise effective Apr 1, 2025
//          This table uses Jan 1, 2025 rates. For E-5 and below retiring
//          after Apr 1, 2025, a small underestimate exists for those months.
//          Has no effect on O-5 and above.
//   2026: 3.8% — FY2026 NDAA (S.5009, signed Dec 18, 2025), effective Jan 1, 2026
//
// DATA SOURCES:
//   2023, 2024, 2026: Directly from navycs.com/DFAS official tables
//   2025, and 2023 values for 18+ YOS officers/WOs: Derived from adjacent
//   year tables using confirmed annual raise percentages per 37 U.S.C. § 1009
//   (verified to match official tables where cross-reference data available)
//
// ── HOW TO ADD FUTURE YEARS ─────────────────────────────────────────────
// 1. Go to https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/
// 2. Add a new key to PAY_TABLES (e.g., 2027: { ... })
// 3. Update PAY_TABLE_YEAR to the new year
// 4. Array index matches YOS_BRACKETS order (see below)
// ════════════════════════════════════════════════════════════════════════

const PAY_TABLE_YEAR = 2026; // Most recent year — used for future retirement months

// Official DoD pay table YOS column breakpoints (years)
// Index: 0    1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18
// Means: <2,  2,  3,  4,  6,  8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 38, 40+
const YOS_BRACKETS = [0, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 38, 40];

const PAY_TABLES = {

  // ══════════════════════════════════════════════════════════════════════
  // 2023 — 4.6% raise, effective January 1, 2023 (FY2023 NDAA)
  // ══════════════════════════════════════════════════════════════════════
  2023: {
    // ── ENLISTED ────────────────────────────────────────────────────────
    "E-1":  [1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918,1918],
    "E-2":  [2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149,2149],
    "E-3":  [2260,2402,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548,2548],
    "E-4":  [2503,2632,2774,2915,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039,3039],
    "E-5":  [2730,2914,3055,3199,3424,3658,3851,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875,3875],
    "E-6":  [2980,3280,3425,3565,3712,4042,4171,4420,4496,4552,4616,4616,4616,4616,4616,4616,4616,4616,4616],
    "E-7":  [3446,3761,3905,4095,4245,4500,4645,4900,5114,5259,5413,5473,5675,5782,6193,6193,6193,6193,6193],
    "E-8":  [null,null,null,null,null,4957,5176,5312,5474,5651,5969,6130,6404,6556,6931,7070,7070,7070,7070],
    "E-9":  [null,null,null,null,null,null,6055,6193,6366,6569,6775,7103,7382,7674,8121,8527,8954,9402,9402],
    // ── WARRANT OFFICERS ────────────────────────────────────────────────
    "W-1":  [3555,3938,4041,4258,4515,4894,5071,5318,5562,5753,5939,6154,6154,6154,6154,6154,6154,6154,6154],
    "W-2":  [4050,4433,4551,4632,4895,5303,5505,5704,5948,6139,6323,6529,6666,6773,6773,6773,6773,6773,6773],
    "W-3":  [4577,4768,4964,5028,5232,5636,6056,6254,6483,6718,7155,7441,7612,7794,8044,8044,8044,8044,8044],
    "W-4":  [5012,5392,5546,5698,5961,6220,6483,6878,7224,7554,7838,8101,8487,8808,9170,9353,9353,9353,9353],
    "W-5":  [null,null,null,null,null,null,null,null,null,null,null,8929,9381,9718,10092,10598,11126,11683,11683],
    // ── COMMISSIONED OFFICERS ────────────────────────────────────────────
    "O-1":  [3637,3786,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577,4577],
    "O-2":  [4191,4773,5497,5682,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799,5799],
    "O-3":  [4850,5498,5934,6470,6780,7120,7340,7702,7890,7890,7890,7890,7890,7890,7890,7890,7890,7890,7890],
    "O-4":  [5516,6385,6812,6906,7302,7726,8255,8666,8951,9115,9210,9210,9210,9210,9210,9210,9210,9210,9210],
    "O-5":  [6393,7202,7700,7794,8106,8292,8701,9002,9389,9983,10265,10545,10862,10862,10862,10862,10862,10862,10862],
    "O-6":  [7669,8425,8978,8978,9013,9399,9450,9450,9987,10936,11494,12050,12368,12689,13311,13577,13577,13577,13577],
    "O-7":  [10113,10583,10800,10973,11286,11595,11953,12309,12667,13790,14737,14737,14737,14737,14814,15110,15110,15110,15110],
    "O-8":  [12171,12570,12834,12908,13239,13790,13918,14442,14592,15043,15697,16299,16701,16701,16701,17119,17546,17546,17546],
    "O-9":  [null,null,null,null,null,null,null,null,null,null,null,17201,17449,17578,17578,17578,17578,17578,17578],
    "O-10": [null,null,null,null,null,null,null,null,null,null,null,17578,17578,17578,17578,17578,17578,17578,17578],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 2024 — 5.2% raise, effective January 1, 2024 (FY2024 NDAA)
  // ══════════════════════════════════════════════════════════════════════
  2024: {
    // ── ENLISTED ────────────────────────────────────────────────────────
    "E-1":  [2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017,2017],
    "E-2":  [2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261,2261],
    "E-3":  [2378,2527,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680,2680],
    "E-4":  [2634,2769,2918,3067,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197,3197],
    "E-5":  [2872,3066,3214,3366,3602,3849,4052,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076,4076],
    "E-6":  [3135,3450,3603,3751,3905,4252,4388,4650,4730,4788,4856,4856,4856,4856,4856,4856,4856,4856,4856],
    "E-7":  [3625,3956,4108,4308,4465,4734,4886,5155,5380,5532,5695,5758,5970,6083,6515,6515,6515,6515,6515],
    "E-8":  [null,null,null,null,null,5215,5445,5588,5759,5945,6279,6449,6737,6897,7291,7438,7438,7438,7438],
    "E-9":  [null,null,null,null,null,null,6370,6515,6697,6910,7127,7472,7765,8073,8544,8970,9419,9891,9891],
    // ── WARRANT OFFICERS ────────────────────────────────────────────────
    "W-1":  [3740,4143,4251,4479,4750,5149,5335,5595,5851,6052,6238,6463,6463,6463,6463,6463,6463,6463,6463],
    "W-2":  [4261,4664,4788,4873,5149,5579,5792,6001,6257,6458,6638,6855,6998,7111,7111,7111,7111,7111,7111],
    "W-3":  [4815,5016,5222,5290,5504,5929,6371,6579,6820,7067,7513,7814,7993,8184,8445,8445,8445,8445,8445],
    "W-4":  [5273,5672,5835,5995,6271,6544,6820,7235,7600,7947,8232,8508,8914,9249,9629,9822,9822,9822,9822],
    "W-5":  [null,null,null,null,null,null,null,null,null,null,null,9376,9851,10205,10597,11128,11684,12269,12269],
    // ── COMMISSIONED OFFICERS ────────────────────────────────────────────
    "O-1":  [3826,3983,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815,4815],
    "O-2":  [4409,5021,5782,5978,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101,6101],
    "O-3":  [5102,5783,6242,6806,7133,7490,7722,8102,8301,8301,8301,8301,8301,8301,8301,8301,8301,8301,8301],
    "O-4":  [5803,6717,7166,7265,7682,8128,8684,9116,9417,9589,9689,9689,9689,9689,9689,9689,9689,9689,9689],
    "O-5":  [6726,7577,8101,8200,8527,8723,9153,9470,9878,10502,10799,11093,11427,11427,11427,11427,11427,11427,11427],
    "O-6":  [8068,8864,9445,9445,9481,9888,9941,9941,10506,11505,12091,12677,13011,13349,14003,14283,14283,14283,14283],
    "O-7":  [10639,11133,11362,11544,11873,12198,12574,12949,13325,14507,15504,15504,15504,15504,15584,15896,15896,15896,15896],
    "O-8":  [12804,13223,13502,13579,13927,14507,14642,15193,15351,15826,16513,17146,17569,17569,17569,18009,18458,18458,18458],
    "O-9":  [null,null,null,null,null,null,null,null,null,null,null,18096,18357,18492,18492,18492,18492,18492,18492],
    "O-10": [null,null,null,null,null,null,null,null,null,null,null,18492,18492,18492,18492,18492,18492,18492,18492],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 2025 — 4.5% raise, effective January 1, 2025 (FY2025 NDAA)
  // Values for 8+ YOS derived from 2024 × 1.045 where not directly available.
  // Note: E-5 and below received additional raise Apr 1, 2025 (not reflected
  // here); has no effect on O-5 and above calculations.
  // ══════════════════════════════════════════════════════════════════════
  2025: {
    // ── ENLISTED ────────────────────────────────────────────────────────
    "E-1":  [2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108,2108],
    "E-2":  [2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363,2363],
    "E-3":  [2485,2641,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801,2801],
    "E-4":  [2752,2893,3050,3205,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341,3341],
    "E-5":  [3002,3204,3359,3517,3764,4022,4234,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260,4260],
    "E-6":  [3277,3606,3765,3920,4081,4444,4585,4859,4943,5004,5075,5075,5075,5075,5075,5075,5075,5075,5075],
    "E-7":  [3788,4134,4293,4502,4666,4947,5106,5387,5622,5781,5951,6017,6238,6357,6809,6809,6809,6809,6809],
    "E-8":  [null,null,null,null,null,5450,5690,5840,6018,6212,6562,6739,7040,7208,7619,7772,7772,7772,7772],
    "E-9":  [null,null,null,null,null,null,6657,6808,6998,7221,7448,7809,8115,8436,8928,9374,9843,10336,10336],
    // ── WARRANT OFFICERS ────────────────────────────────────────────────
    "W-1":  [3908,4329,4442,4681,4964,5381,5575,5847,6114,6324,6519,6754,6754,6754,6754,6754,6754,6754,6754],
    "W-2":  [4453,4874,5003,5092,5381,5830,6053,6271,6539,6749,6937,7163,7313,7431,7431,7431,7431,7431,7431],
    "W-3":  [5032,5242,5457,5528,5752,6196,6658,6875,7127,7385,7851,8165,8353,8552,8825,8825,8825,8825,8825],
    "W-4":  [5510,5927,6097,6265,6553,6838,7127,7561,7942,8305,8602,8891,9315,9665,10062,10264,10264,10264,10264],
    "W-5":  [null,null,null,null,null,null,null,null,null,null,null,9798,10294,10664,11074,11629,12210,12821,12821],
    // ── COMMISSIONED OFFICERS ────────────────────────────────────────────
    "O-1":  [3999,4162,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031,5031],
    "O-2":  [4607,5247,6043,6247,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376,6376],
    "O-3":  [5332,6044,6523,7113,7454,7827,8070,8467,8675,8675,8675,8675,8675,8675,8675,8675,8675,8675,8675],
    "O-4":  [6064,7020,7488,7592,8027,8494,9075,9526,9840,10020,10125,10125,10125,10125,10125,10125,10125,10125,10125],
    "O-5":  [7028,7918,8465,8569,8911,9115,9565,9896,10323,10975,11285,11592,11941,11941,11941,11941,11941,11941,11941],
    "O-6":  [8431,9262,9870,9870,9908,10333,10389,10389,10979,12023,12635,13248,13597,13950,14633,14926,14926,14926,14926],
    "O-7":  [11118,11634,11873,12063,12407,12747,13140,13532,13925,15160,16202,16202,16202,16202,16285,16611,16611,16611,16611],
    "O-8":  [13380,13818,14109,14191,14554,15160,15301,15877,16042,16538,17256,17917,18360,18360,18360,18808,18808,18808,18808],
    "O-9":  [null,null,null,null,null,null,null,null,null,null,null,18808,18808,18808,18808,18808,18808,18808,18808],
    "O-10": [null,null,null,null,null,null,null,null,null,null,null,18808,18808,18808,18808,18808,18808,18808,18808],
  },

  // ══════════════════════════════════════════════════════════════════════
  // 2026 — 3.8% raise, effective January 1, 2026 (FY2026 NDAA, S.5009)
  // ══════════════════════════════════════════════════════════════════════
  2026: {
    // ── ENLISTED ────────────────────────────────────────────────────────
    "E-1":  [2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407,2407],
    "E-2":  [2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698,2698],
    "E-3":  [2837,3015,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198,3198],
    "E-4":  [3142,3303,3482,3659,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815,3815],
    "E-5":  [3343,3598,3776,3947,4110,4300,4395,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422,4422],
    "E-6":  [3401,3743,3908,4068,4236,4612,4760,5044,5131,5194,5268,5268,5268,5268,5268,5268,5268,5268,5268],
    "E-7":  [3932,4291,4456,4673,4844,5135,5300,5592,5835,6001,6177,6245,6475,6598,7067,7067,7067,7067,7067],
    "E-8":  [null,null,null,null,null,5657,5907,6062,6247,6448,6811,6995,7308,7482,7909,8068,8068,8068,8068],
    "E-9":  [null,null,null,null,null,null,6910,7067,7264,7496,7731,8105,8423,8756,9268,9730,10217,10729,10729],
    // ── WARRANT OFFICERS ────────────────────────────────────────────────
    "W-1":  [4057,4494,4611,4859,5152,5585,5786,6069,6346,6565,6766,7010,7010,7010,7010,7010,7010,7010,7010],
    "W-2":  [4622,5059,5194,5286,5586,6052,6282,6509,6787,7005,7201,7437,7592,7714,7714,7714,7714,7714,7714],
    "W-3":  [5223,5441,5664,5738,5971,6431,6910,7136,7398,7666,8150,8477,8672,8879,9162,9162,9162,9162,9162],
    "W-4":  [5720,6152,6329,6503,6802,7098,7398,7848,8244,8620,8928,9228,9669,10032,10445,10654,10654,10654,10654],
    "W-5":  [null,null,null,null,null,null,null,null,null,null,null,10170,10686,11070,11495,12071,12673,13308,13308],
    // ── COMMISSIONED OFFICERS ────────────────────────────────────────────
    "O-1":  [4150,4320,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222,5222],
    "O-2":  [4782,5446,6272,6484,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618,6618],
    "O-3":  [5535,6273,6771,7383,7737,8125,8376,8788,9004,9004,9004,9004,9004,9004,9004,9004,9004,9004,9004],
    "O-4":  [6294,7286,7773,7881,8332,8816,9419,9888,10214,10402,10510,10510,10510,10510,10510,10510,10510,10510,10510],
    "O-5":  [7295,8219,8787,8894,9250,9462,9929,10272,10714,11392,11714,12033,12394,12394,12394,12394,12394,12394,12394],
    "O-6":  [8751,9614,10245,10245,10284,10725,10784,10784,11396,12480,13115,13751,14113,14479,15189,15258,15258,15258,15258],
    "O-7":  [11540,12076,12325,12522,12879,13232,13639,14046,14454,15736,16818,16818,16818,16818,16904,17242,17242,17242,17242],
    "O-8":  [13888,14344,14645,14730,15107,15736,15882,16480,16652,17166,18598,18598,18999,18999,18999,18999,18999,18999,18999],
    "O-9":  [null,null,null,null,null,null,null,null,null,null,null,18999,18999,18999,18999,18999,18999,18999,18999],
    "O-10": [null,null,null,null,null,null,null,null,null,null,null,18999,18999,18999,18999,18999,18999,18999,18999],
  },
};

/**
 * Select the correct pay table for a given calendar date.
 * Authority: 37 U.S.C. § 1009 — pay tables take effect Jan 1 each year.
 * Clamps to 2023 for any date before 2023 (earliest table available),
 * and to PAY_TABLE_YEAR for any future date beyond the most recent table.
 */
function getPayTableForDate(dateStr) {
  const year = new Date(dateStr).getFullYear();
  const clampedYear = Math.max(2023, Math.min(PAY_TABLE_YEAR, year));
  return PAY_TABLES[clampedYear];
}

const ALL_GRADES = [
  "E-1","E-2","E-3","E-4","E-5","E-6","E-7","E-8","E-9",
  "W-1","W-2","W-3","W-4","W-5",
  "O-1","O-2","O-3","O-4","O-5","O-6","O-7","O-8","O-9","O-10"
];

// ═══════════════════════════════════════════════════════════════════════════
// CALCULATION ENGINE — all statutory references embedded as comments
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Look up basic pay for a grade at a given YOS (decimal years) and date.
 * Authority: 37 U.S.C. § 203; DoD FMR Vol. 7A Ch. 1
 * YOS for basic pay purposes is calculated from PEBD/BASD (37 U.S.C. § 205).
 * dateStr selects the historically correct pay table for that month (§ 1009).
 */
function getBasicPay(grade, yos, dateStr) {
  const table = getPayTableForDate(dateStr || new Date().toISOString().slice(0,10));
  const arr = table[grade];
  if (!arr) return 0;
  let idx = 0;
  for (let i = 0; i < YOS_BRACKETS.length; i++) {
    if (yos >= YOS_BRACKETS[i]) idx = i;
    else break;
  }
  return arr[idx] ?? 0;
}

/**
 * Detect retirement system from PEBD (Date of Initial Entry Military Service / DIEMS).
 * Authority: 10 U.S.C. § 1409; DoD FMR Vol. 7B Ch. 3
 *   Final Pay  — entered before Sep 8, 1980
 *   High-3     — entered Sep 8, 1980 through Dec 31, 2017 (default; REDUX optional for 1986-2017)
 *   BRS        — entered Jan 1, 2018 or later (or opted in)
 */
function detectRetirementSystem(pebdStr) {
  if (!pebdStr) return "HIGH_3";
  const pebd = new Date(pebdStr);
  if (pebd < new Date("1980-09-08")) return "FINAL_PAY";
  if (pebd >= new Date("2018-01-01")) return "BRS";
  return "HIGH_3";
}

/**
 * Calculate active duty months between two dates.
 * Authority: 10 U.S.C. § 1405(a)(1)–(a)(2) — active duty service
 *            10 U.S.C. § 1405(b)            — fractional years: each full month = 1/12 year
 */
function calcADMonths(adbdStr, retDateStr) {
  const s = new Date(adbdStr);
  const e = new Date(retDateStr);
  return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
}

/**
 * Convert IAD points to § 1405 service years.
 * Authority: 10 U.S.C. § 1405(a)(3) — credits years of service under § 12733
 *            10 U.S.C. § 12733       — computation of reserve retirement points
 *            DoD FMR Vol. 7B Ch. 3, Para 030201
 *
 * Formula: IAD Points ÷ 360 = additional years of § 1405 service
 *
 * CRITICAL: These points ONLY enhance the multiplier AFTER the member has
 * already qualified with 20 full years of active duty service. They do NOT
 * count toward the 20-year qualifying threshold itself.
 * Ref: National Guard Bureau guidance; Army HRC retirement guidance
 */
function iadPointsToYears(iadPoints) {
  return iadPoints / 360;
}

/**
 * Calculate total § 1405 years (active + IAD) for the multiplier.
 * Authority: 10 U.S.C. § 1405(a)(1)–(a)(3)
 */
function calcTotal1405Years(adMonths, iadPoints) {
  const adYears = adMonths / 12;
  const qualifies = adYears >= 20; // Must have ≥20 yrs AD before § 1405(a)(3) applies
  const iadYears = qualifies ? iadPointsToYears(iadPoints) : 0;
  return adYears + iadYears;
}

/**
 * Calculate retirement pay multiplier.
 * Authority: 10 U.S.C. § 1409
 *   Final Pay / High-3 / REDUX: 2.5% per year (§ 1409(b)(1))
 *   BRS: 2.0% per year (§ 1409(b)(2), as amended by FY2016 NDAA)
 *   Maximum: 75% (Final Pay / High-3) or 60% (BRS) at 30 years
 *   § 1405(b): each full month beyond whole years counts as 1/12 year
 */
function calcMultiplier(total1405Years, retSys) {
  if (retSys === "BRS") {
    return Math.min(total1405Years * 0.02, 0.60);
  }
  return Math.min(total1405Years * 0.025, 0.75);
}

/**
 * Calculate the High-36 retired pay base (average of 36 months of basic pay).
 * Authority: 10 U.S.C. § 1407 (High-36 retired pay base)
 *            DoD FMR Vol. 7B Ch. 3, Para 030403
 * Each month uses the pay table in effect that calendar year (37 U.S.C. § 1009),
 * correcting for the fact that historical pay tables were lower than current rates.
 * Future months beyond PAY_TABLE_YEAR use the most recent available table,
 * optionally compounded by a projected annual raise rate.
 *
 * @param annualRaiseRate  Decimal (e.g. 0.02 = 2%). Applied only to months
 *                         beyond PAY_TABLE_YEAR when useProjectedRaise = true.
 *                         Reflects 37 U.S.C. § 1009 ECI-linked raise mechanism.
 */
function calcHigh3(retDateStr, grade, promotionDateStr, prevGrade, pebdStr, annualRaiseRate = 0, useProjectedRaise = false) {
  const retDate = new Date(retDateStr);
  const promDate = promotionDateStr ? new Date(promotionDateStr) : null;
  const pebd = new Date(pebdStr);
  let total = 0;
  const months = [];

  for (let i = 35; i >= 0; i--) {
    const d = new Date(retDate);
    d.setMonth(d.getMonth() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dYear = d.getFullYear();

    // Determine grade: if promotion is within 36-month window, use prevGrade before it
    const g = (promDate && d < promDate && prevGrade) ? prevGrade : grade;

    // YOS for basic pay (from PEBD) — 37 U.S.C. § 205
    const yosMonths = (d.getFullYear() - pebd.getFullYear()) * 12
                    + (d.getMonth() - pebd.getMonth());
    const yos = yosMonths / 12;

    // Use historically correct pay table for this month — 37 U.S.C. § 1009
    // For months beyond PAY_TABLE_YEAR, clamp to most recent table then
    // optionally project forward using the compounded annual raise rate.
    const basePay = getBasicPay(g, yos, dStr);
    const tableYear = Math.max(2023, Math.min(PAY_TABLE_YEAR, dYear));
    const yearsAhead = Math.max(0, dYear - PAY_TABLE_YEAR);
    const projected = useProjectedRaise && yearsAhead > 0;
    const raiseFactor = projected ? Math.pow(1 + annualRaiseRate, yearsAhead) : 1;
    const pay = Math.round(basePay * raiseFactor);

    total += pay;
    months.push({
      date: d.toLocaleDateString("en-US",{year:"numeric",month:"short"}),
      grade: g, yos: yos.toFixed(1), pay, tableYear,
      projected, yearsAhead, raiseFactor
    });
  }
  return { avg: total / 36, months };
}

/**
 * Calculate Final Pay retired pay base (last month's basic pay only).
 * Authority: 10 U.S.C. § 1406(c)
 */
function calcFinalPay(retDateStr, grade, pebdStr, annualRaiseRate = 0, useProjectedRaise = false) {
  const retDate = new Date(retDateStr);
  const pebd = new Date(pebdStr);
  const yosMonths = (retDate.getFullYear() - pebd.getFullYear()) * 12
                  + (retDate.getMonth() - pebd.getMonth());
  const basePay = getBasicPay(grade, yosMonths / 12, retDateStr);
  const yearsAhead = Math.max(0, retDate.getFullYear() - PAY_TABLE_YEAR);
  const raiseFactor = (useProjectedRaise && yearsAhead > 0) ? Math.pow(1 + annualRaiseRate, yearsAhead) : 1;
  return Math.round(basePay * raiseFactor);
}

/**
 * Full retirement calculation for a given retirement date.
 * Returns all intermediate values for transparency and audit.
 */
function calcRetirement({ retDateStr, adbdStr, pebdStr, iadPoints, grade, promotionDateStr, prevGrade, retSys, annualRaiseRate, useProjectedRaise }) {
  // Step 1: Active duty months (§ 1405(a)(1)–(a)(2))
  const adMonths = calcADMonths(adbdStr, retDateStr);
  const adYears = adMonths / 12;

  // Step 2: IAD § 1405 service (§ 1405(a)(3) via § 12733) — only if ≥20 AD yrs
  const qualifiesFor1405 = adYears >= 20;
  const iadYears = qualifiesFor1405 ? iadPointsToYears(iadPoints) : 0;
  const total1405Years = adYears + iadYears;

  // Step 3: Multiplier (§ 1409)
  const multiplier = calcMultiplier(total1405Years, retSys);

  // Step 4: Retired pay base (§ 1406 or § 1407)
  let retiredPayBase, high3Months;
  if (retSys === "FINAL_PAY") {
    retiredPayBase = calcFinalPay(retDateStr, grade, pebdStr, annualRaiseRate, useProjectedRaise);
    high3Months = [];
  } else {
    const h3 = calcHigh3(retDateStr, grade, promotionDateStr, prevGrade, pebdStr, annualRaiseRate, useProjectedRaise);
    retiredPayBase = h3.avg;
    high3Months = h3.months;
  }

  // Step 5: Monthly gross retirement pay
  const monthlyPay = retiredPayBase * multiplier;

  return {
    retDateStr,
    adMonths,
    adYears,
    qualifiesFor1405,
    iadYears,
    total1405Years,
    multiplier,
    retiredPayBase,
    high3Months,
    monthlyPay,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

const fmt$ = (n) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtPct = (n) => (n * 100).toFixed(2) + "%";
const fmtYrs = (n) => {
  const years = Math.floor(n);
  const months = Math.round((n - years) * 12);
  return `${years}y ${months}m`;
};

const SYSTEM_LABELS = {
  FINAL_PAY: "Final Pay (pre-Sep 8 1980)",
  HIGH_3: "High-36 (§ 1407)",
  BRS: "Blended Retirement (BRS)",
};

const SYSTEM_AUTHORITIES = {
  FINAL_PAY: "10 U.S.C. § 1406(c)",
  HIGH_3: "10 U.S.C. § 1407",
  BRS: "10 U.S.C. § 1409(b)(2); FY2016 NDAA",
};

export default function RetirementCalculator() {
  const today = new Date();

  const [pebd, setPebd] = useState("1999-06-01");
  const [adbd, setAdbd] = useState("2004-11-25");
  const [iadPoints, setIadPoints] = useState(355);
  const [grade, setGrade] = useState("O-6");
  const [promotionDate, setPromotionDate] = useState("2025-10-01");
  const [prevGrade, setPrevGrade] = useState("O-5");
  const [retSysOverride, setRetSysOverride] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [useProjectedRaise, setUseProjectedRaise] = useState(false);
  const [annualRaiseRate, setAnnualRaiseRate] = useState(2.0); // percent, e.g. 2.0 = 2%

  const autoRetSys = useMemo(() => detectRetirementSystem(pebd), [pebd]);
  const retSys = retSysOverride || autoRetSys;

  // Compute the first retirement month where ALL 36 High-3 months are at current grade.
  // Authority: 10 U.S.C. § 1407 — High-36 avg; 36 months preceding retirement date.
  // Once the retirement date is >= promotionDate + 36 months, no previous-grade months
  // remain in the lookback window, and the member receives the full benefit of their
  // current grade's basic pay across the entire High-3 average.
  const fullGradeHigh3Index = useMemo(() => {
    if (!promotionDate || !prevGrade) return null; // no grade change to track
    const promDate = new Date(promotionDate);
    const fullDate = new Date(promDate);
    fullDate.setMonth(fullDate.getMonth() + 36); // 36 months after promotion
    for (let m = 0; m < 60; m++) {
      const retDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
      if (retDate >= fullDate) return m;
    }
    return null; // falls outside the 60-month window
  }, [promotionDate, prevGrade]);

  // Generate 60 monthly retirement scenarios
  const projections = useMemo(() => {
    if (!pebd || !adbd) return [];
    const rows = [];
    for (let m = 0; m < 60; m++) {
      const retDate = new Date(today.getFullYear(), today.getMonth() + m, 1);
      const retDateStr = retDate.toISOString().slice(0, 10);
      const result = calcRetirement({
        retDateStr, adbdStr: adbd, pebdStr: pebd,
        iadPoints: Number(iadPoints), grade,
        promotionDateStr: promotionDate, prevGrade, retSys,
        annualRaiseRate: annualRaiseRate / 100,
        useProjectedRaise,
      });
      rows.push({ ...result, monthOffset: m });
    }
    return rows;
  }, [pebd, adbd, iadPoints, grade, promotionDate, prevGrade, retSys, annualRaiseRate, useProjectedRaise]);

  const chartData = projections.map(r => ({
    name: new Date(r.retDateStr).toLocaleDateString("en-US", { month:"short", year:"2-digit" }),
    pay: Math.round(r.monthlyPay),
    multiplier: +(r.multiplier * 100).toFixed(2),
  }));

  const sel = selectedRow != null ? projections[selectedRow] : null;

  const styles = {
    root: {
      fontFamily: "'Courier New', Courier, monospace",
      background: "#0b0f1a",
      minHeight: "100vh",
      color: "#c8d0e0",
      padding: "24px",
      fontSize: "13px",
    },
    header: {
      borderBottom: "2px solid #c8a84b",
      paddingBottom: "12px",
      marginBottom: "24px",
    },
    title: {
      fontSize: "22px",
      fontWeight: "bold",
      color: "#f0c040",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      margin: 0,
    },
    subtitle: {
      color: "#7a8a9e",
      fontSize: "11px",
      marginTop: "4px",
    },
    badge: {
      display: "inline-block",
      background: "#1a2233",
      border: "1px solid #c8a84b",
      color: "#c8a84b",
      padding: "2px 8px",
      fontSize: "10px",
      borderRadius: "2px",
      marginLeft: "10px",
      verticalAlign: "middle",
    },
    section: {
      background: "#111827",
      border: "1px solid #1e2d45",
      borderRadius: "4px",
      padding: "16px",
      marginBottom: "16px",
    },
    sectionTitle: {
      color: "#f0c040",
      fontSize: "11px",
      fontWeight: "bold",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      marginBottom: "12px",
      borderBottom: "1px solid #1e2d45",
      paddingBottom: "6px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
      gap: "12px",
    },
    label: {
      display: "block",
      color: "#7a8a9e",
      fontSize: "10px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      marginBottom: "4px",
    },
    input: {
      width: "100%",
      background: "#0d1520",
      border: "1px solid #2a3a50",
      borderRadius: "3px",
      color: "#e0e8f0",
      padding: "6px 8px",
      fontSize: "13px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      outline: "none",
    },
    select: {
      width: "100%",
      background: "#0d1520",
      border: "1px solid #2a3a50",
      borderRadius: "3px",
      color: "#e0e8f0",
      padding: "6px 8px",
      fontSize: "13px",
      fontFamily: "inherit",
      boxSizing: "border-box",
      outline: "none",
    },
    stat: {
      background: "#0d1520",
      border: "1px solid #1e2d45",
      borderRadius: "3px",
      padding: "10px 14px",
      textAlign: "center",
    },
    statLabel: { color: "#7a8a9e", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase" },
    statVal: { color: "#f0c040", fontSize: "20px", fontWeight: "bold", marginTop: "4px" },
    statSub: { color: "#4a6080", fontSize: "10px", marginTop: "2px" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "12px",
    },
    th: {
      background: "#0d1520",
      color: "#c8a84b",
      padding: "7px 10px",
      textAlign: "right",
      borderBottom: "2px solid #1e2d45",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    },
    thLeft: {
      background: "#0d1520",
      color: "#c8a84b",
      padding: "7px 10px",
      textAlign: "left",
      borderBottom: "2px solid #1e2d45",
      fontSize: "10px",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    },
    td: {
      padding: "6px 10px",
      textAlign: "right",
      borderBottom: "1px solid #111827",
      color: "#c8d0e0",
    },
    tdLeft: {
      padding: "6px 10px",
      textAlign: "left",
      borderBottom: "1px solid #111827",
      color: "#c8d0e0",
    },
    tabBar: {
      display: "flex",
      gap: "4px",
      marginBottom: "16px",
    },
    tab: (active) => ({
      padding: "6px 14px",
      fontSize: "11px",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      border: "1px solid",
      borderRadius: "2px",
      cursor: "pointer",
      fontFamily: "inherit",
      background: active ? "#c8a84b" : "#0d1520",
      color: active ? "#0b0f1a" : "#c8a84b",
      borderColor: "#c8a84b",
      fontWeight: active ? "bold" : "normal",
    }),
    cite: {
      color: "#4a6080",
      fontSize: "10px",
      fontStyle: "italic",
    },
    alert: {
      background: "#1a1000",
      border: "1px solid #c8a84b",
      borderRadius: "3px",
      padding: "10px 14px",
      color: "#c8a84b",
      fontSize: "11px",
      marginBottom: "12px",
    },
    breakdownRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      borderBottom: "1px solid #1e2d45",
      padding: "8px 0",
    },
    breakdownLabel: { color: "#7a8a9e", fontSize: "11px", flex: 1 },
    breakdownVal: { color: "#f0c040", fontSize: "13px", fontWeight: "bold", fontFamily: "monospace", marginLeft: "16px" },
    breakdownCite: { color: "#2a4060", fontSize: "10px", marginTop: "2px" },
    closeBtn: {
      background: "none",
      border: "1px solid #c8a84b",
      color: "#c8a84b",
      padding: "4px 12px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: "11px",
      borderRadius: "2px",
      float: "right",
    },
  };

  // Summary stats from month 0 (today's retirement)
  const now0 = projections[0];
  const now12 = projections[11];
  const now24 = projections[23];
  const now60 = projections[59];

  // Custom target retirement date for snapshot
  const [customMonth, setCustomMonth] = useState(today.getMonth()); // 0-indexed
  const [customYear, setCustomYear]   = useState(today.getFullYear() + 1);

  const customRowIndex = useMemo(() => {
    return projections.findIndex(r => {
      const d = new Date(r.retDateStr);
      return d.getFullYear() === customYear && d.getMonth() === customMonth;
    });
  }, [projections, customMonth, customYear]);

  const customRow = customRowIndex >= 0 ? projections[customRowIndex] : null;

  // Build year options spanning the 60-month projection window
  const projectionYears = useMemo(() => {
    const years = new Set();
    projections.forEach(r => years.add(new Date(r.retDateStr).getFullYear()));
    return [...years].sort();
  }, [projections]);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={styles.root}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <p style={styles.title}>
              Military Retirement Pay Calculator
              <span style={styles.badge}>{PAY_TABLE_YEAR} PAY TABLE</span>
            </p>
            <p style={styles.subtitle}>
              § 1405 / § 1407 / § 1409 · IAD Points Integration · 60-Month Forward Projection
              &nbsp;·&nbsp; Pay table: DFAS.mil effective Jan 1, {PAY_TABLE_YEAR}
            </p>
          </div>
        </div>
      </div>

      {/* INPUTS */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Service Data Inputs</div>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>PEBD / DIEMS Date
              <span style={{...styles.cite, display:"block"}}>Used for: retirement sys detection (§ 1409) &amp; basic pay YOS (37 U.S.C. § 205)</span>
            </label>
            <input style={styles.input} type="date" value={pebd} onChange={e => setPebd(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Active Duty Base Date (ADBD)
              <span style={{...styles.cite, display:"block"}}>Used for: computing AD years (10 U.S.C. § 1405(a)(1)–(a)(2))</span>
            </label>
            <input style={styles.input} type="date" value={adbd} onChange={e => setAdbd(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>IAD / Reserve Points (total non-AD)
              <span style={{...styles.cite, display:"block"}}>Authority: § 1405(a)(3) via § 12733 · Points ÷ 360 = added yrs</span>
            </label>
            <input style={styles.input} type="number" min="0" value={iadPoints}
              onChange={e => setIadPoints(e.target.value)} placeholder="e.g. 365" />
          </div>
          <div>
            <label style={styles.label}>Current Grade / Rank
              <span style={{...styles.cite, display:"block"}}>Used for High-36 lookup (§ 1407) &amp; final pay (§ 1406)</span>
            </label>
            <select style={styles.select} value={grade} onChange={e => setGrade(e.target.value)}>
              {ALL_GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Current Grade Promotion Date
              <span style={{...styles.cite, display:"block"}}>If within 36 months, affects High-36 avg (§ 1407)</span>
            </label>
            <input style={styles.input} type="date" value={promotionDate} onChange={e => setPromotionDate(e.target.value)} />
          </div>
          <div>
            <label style={styles.label}>Previous Grade (if promotion within 36 mo)
              <span style={{...styles.cite, display:"block"}}>Used for High-36 months before promotion date</span>
            </label>
            <select style={styles.select} value={prevGrade} onChange={e => setPrevGrade(e.target.value)}>
              <option value="">— Same grade / N/A —</option>
              {ALL_GRADES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={styles.label}>Retirement System Override
              <span style={{...styles.cite, display:"block"}}>Auto-detected from PEBD; override if REDUX elected</span>
            </label>
            <select style={styles.select} value={retSysOverride} onChange={e => setRetSysOverride(e.target.value)}>
              <option value="">Auto-detect from PEBD ({SYSTEM_LABELS[autoRetSys]})</option>
              <option value="FINAL_PAY">Final Pay — § 1406(c)</option>
              <option value="HIGH_3">High-36 — § 1407</option>
              <option value="BRS">Blended Retirement (BRS) — § 1409(b)(2)</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Projected Annual Pay Raise
              <span style={{...styles.cite, display:"block"}}>Applied to future months beyond {PAY_TABLE_YEAR} pay table (37 U.S.C. § 1009)</span>
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setUseProjectedRaise(v => !v)}
                style={{
                  padding: "6px 12px",
                  background: useProjectedRaise ? "#1a4a2a" : "#0d1520",
                  border: `1px solid ${useProjectedRaise ? "#40c080" : "#2a3a50"}`,
                  color: useProjectedRaise ? "#40c080" : "#4a6080",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "11px",
                  fontWeight: "bold",
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                {useProjectedRaise ? "● ON" : "○ OFF"}
              </button>
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  style={{ ...styles.input, paddingRight: "28px", opacity: useProjectedRaise ? 1 : 0.4 }}
                  type="number" min="0" max="20" step="0.1"
                  value={annualRaiseRate}
                  onChange={e => setAnnualRaiseRate(parseFloat(e.target.value) || 0)}
                  disabled={!useProjectedRaise}
                />
                <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", color: "#4a6080", fontSize: "12px", pointerEvents: "none" }}>%</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: "12px", ...styles.alert }}>
          <strong>Active System:</strong> {SYSTEM_LABELS[retSys]}
          &nbsp;&nbsp;<span style={{ color: "#4a6080" }}>Authority: {SYSTEM_AUTHORITIES[retSys]}</span>
          {retSys !== "FINAL_PAY" && (
            <span style={{ marginLeft: "16px", color: "#4a6080" }}>
              Retired pay base: 36-month average basic pay ending on retirement date (10 U.S.C. § 1407)
            </span>
          )}
          {useProjectedRaise && (
            <span style={{ marginLeft: "16px", color: "#40c080", fontWeight: "bold" }}>
              ▲ Projected raise: {annualRaiseRate}%/yr applied to months after {PAY_TABLE_YEAR}
            </span>
          )}
        </div>
      </div>

      {/* SUMMARY STATS */}
      {projections.length > 0 && now0 && (
        <div style={{ ...styles.section }}>
          <div style={styles.sectionTitle}>Snapshot — Est. Monthly Retirement Pay</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
            {[
              { label: "If Retiring Today", row: now0 },
              { label: "+ 12 Months", row: now12 },
              { label: "+ 24 Months", row: now24 },
              { label: `★ Full ${grade} High-3`, row: fullGradeHigh3Index != null ? projections[fullGradeHigh3Index] : null, highlight: true },
              { label: "+ 60 Months", row: now60 },
            ].map(({ label, row, highlight }) => (
              <div key={label} style={{
                ...styles.stat,
                ...(highlight ? { border: "2px solid #40c080", background: "#0a1f14" } : {}),
              }}>
                <div style={{ ...styles.statLabel, ...(highlight ? { color: "#40c080" } : {}) }}>{label}</div>
                <div style={{ ...styles.statVal, ...(highlight ? { color: "#40c080" } : {}) }}>{row ? fmt$(row.monthlyPay) : "Outside window"}</div>
                <div style={styles.statSub}>{row ? `${fmtPct(row.multiplier)} × ${fmt$(row.retiredPayBase)}` : ""}</div>
                {highlight && row && (
                  <div style={{ fontSize: "10px", color: "#2a7050", marginTop: "3px" }}>
                    {new Date(row.retDateStr).toLocaleDateString("en-US",{month:"short",year:"numeric"})} · § 1407 fully satisfied
                  </div>
                )}
              </div>
            ))}

            {/* CUSTOM DATE SNAPSHOT CARD */}
            <div style={{
              ...styles.stat,
              border: "2px solid #6080c8",
              background: "#0a1020",
              gridColumn: "span 1",
            }}>
              <div style={{ ...styles.statLabel, color: "#6080c8", marginBottom: "6px" }}>
                Custom Date
              </div>
              {/* Month + Year pickers */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
                <select
                  value={customMonth}
                  onChange={e => setCustomMonth(Number(e.target.value))}
                  style={{
                    flex: 1, background: "#0d1520", border: "1px solid #2a3a60",
                    color: "#c0c8e0", borderRadius: "3px", padding: "4px 2px",
                    fontSize: "11px", fontFamily: "inherit", outline: "none",
                  }}>
                  {MONTH_NAMES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select
                  value={customYear}
                  onChange={e => setCustomYear(Number(e.target.value))}
                  style={{
                    flex: 1, background: "#0d1520", border: "1px solid #2a3a60",
                    color: "#c0c8e0", borderRadius: "3px", padding: "4px 2px",
                    fontSize: "11px", fontFamily: "inherit", outline: "none",
                  }}>
                  {projectionYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              {customRow ? (
                <>
                  <div style={{ ...styles.statVal, color: "#8098e0", fontSize: "18px" }}>
                    {fmt$(customRow.monthlyPay)}
                  </div>
                  <div style={styles.statSub}>
                    {fmtPct(customRow.multiplier)} × {fmt$(customRow.retiredPayBase)}
                  </div>
                  <div style={{ fontSize: "10px", color: "#3a5090", marginTop: "3px" }}>
                    {new Date(customRow.retDateStr).toLocaleDateString("en-US",{month:"short",year:"numeric"})} · {fmtYrs(customRow.total1405Years)} total
                  </div>
                </>
              ) : (
                <div style={{ color: "#4a5070", fontSize: "11px", marginTop: "4px" }}>
                  Outside 60-month window
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div style={styles.tabBar}>
        <button style={styles.tab(activeTab === "table")} onClick={() => setActiveTab("table")}>Projection Table</button>
        <button style={styles.tab(activeTab === "chart")} onClick={() => setActiveTab("chart")}>Pay Chart</button>
        <button style={styles.tab(activeTab === "refs")} onClick={() => setActiveTab("refs")}>Regulatory Refs</button>
        <button style={styles.tab(activeTab === "update")} onClick={() => setActiveTab("update")}>Update Pay Table</button>
      </div>

      {/* PROJECTION TABLE */}
      {activeTab === "table" && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            60-Month Retirement Projection · Click any row for full breakdown
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "10px", flexWrap: "wrap" }}>
            {fullGradeHigh3Index != null && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#7a8a9e" }}>
                <div style={{ width: "12px", height: "12px", background: "#0a2a1a", border: "2px solid #40c080", borderRadius: "2px", flexShrink: 0 }} />
                <span>
                  <span style={{ color: "#40c080", fontWeight: "bold" }}>★ Full {grade} High-3</span>
                  {" — first month where all 36 lookback months are at {grade} pay (§ 1407)"}
                  {promotionDate && (
                    <span style={{ color: "#4a6080" }}>
                      {" "}· Promotion {new Date(promotionDate).toLocaleDateString("en-US",{month:"short",year:"numeric"})} + 36 mo
                    </span>
                  )}
                </span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#7a8a9e" }}>
              <div style={{ width: "12px", height: "12px", background: "#0a1228", border: "2px solid #6080c8", borderRadius: "2px", flexShrink: 0 }} />
              <span><span style={{ color: "#8098e0", fontWeight: "bold" }}>◆ Selected</span> — custom target date from snapshot</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#7a8a9e" }}>
              <div style={{ width: "12px", height: "12px", background: "#1a2a0a", border: "1px solid #4a6080", borderRadius: "2px", flexShrink: 0 }} />
              <span>Selected row (click to expand breakdown)</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.thLeft}>Ret. Date</th>
                  <th style={styles.th}>AD Service<br/><span style={styles.cite}>§ 1405(a)(1-2)</span></th>
                  <th style={styles.th}>IAD Yrs<br/><span style={styles.cite}>§ 1405(a)(3)</span></th>
                  <th style={styles.th}>Total § 1405<br/><span style={styles.cite}>§ 1405(a)</span></th>
                  <th style={styles.th}>Multiplier<br/><span style={styles.cite}>§ 1409</span></th>
                  <th style={styles.th}>Ret. Pay Base<br/><span style={styles.cite}>§ 1407/1406</span></th>
                  <th style={styles.th}>Monthly Pay</th>
                  <th style={styles.th}>Annual Pay</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((r, i) => {
                  const isSelected = selectedRow === i;
                  const isPast = new Date(r.retDateStr) < today;
                  const isFullGradeH3 = i === fullGradeHigh3Index;
                  const isCustom = i === customRowIndex;
                  const rowBg = isSelected
                    ? "#1a2a0a"
                    : isFullGradeH3
                      ? "#0a2218"
                      : isCustom
                        ? "#0a1228"
                        : i % 2 === 0 ? "#0f1622" : "#111827";
                  const rowBorder = isFullGradeH3
                    ? "3px solid #40c080"
                    : isCustom
                      ? "3px solid #6080c8"
                      : isSelected ? "3px solid #c8a84b" : "3px solid transparent";
                  return (
                    <tr key={i}
                      style={{
                        background: rowBg,
                        cursor: "pointer",
                        opacity: isPast ? 0.6 : 1,
                        borderLeft: rowBorder,
                      }}
                      onClick={() => setSelectedRow(isSelected ? null : i)}>
                      <td style={{ ...styles.tdLeft, color: isPast ? "#4a6080" : isFullGradeH3 ? "#40c080" : isCustom ? "#8098e0" : "#e0e8f0" }}>
                        {new Date(r.retDateStr).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        {isPast && <span style={{ color: "#c8a84b", marginLeft: 6, fontSize: "10px" }}>PAST</span>}
                        {isFullGradeH3 && (
                          <span style={{
                            color: "#40c080", marginLeft: 6, fontSize: "10px",
                            background: "#0d3020", border: "1px solid #40c080",
                            padding: "1px 5px", borderRadius: "2px", fontWeight: "bold",
                          }}>
                            ★ FULL {grade} HIGH-3
                          </span>
                        )}
                        {isCustom && !isFullGradeH3 && (
                          <span style={{
                            color: "#8098e0", marginLeft: 6, fontSize: "10px",
                            background: "#0d1535", border: "1px solid #6080c8",
                            padding: "1px 5px", borderRadius: "2px", fontWeight: "bold",
                          }}>
                            ◆ SELECTED
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>{fmtYrs(r.adYears)}</td>
                      <td style={{ ...styles.td, color: r.qualifiesFor1405 ? "#80c080" : "#4a6080" }}>
                        {r.qualifiesFor1405 ? fmtYrs(r.iadYears) : "—"}
                      </td>
                      <td style={{ ...styles.td, color: "#e0e8f0", fontWeight: "bold" }}>{fmtYrs(r.total1405Years)}</td>
                      <td style={{ ...styles.td, color: "#f0c040" }}>{fmtPct(r.multiplier)}</td>
                      <td style={{ ...styles.td, color: isFullGradeH3 ? "#40c080" : undefined }}>{fmt$(r.retiredPayBase)}</td>
                      <td style={{ ...styles.td, color: "#f0c040", fontSize: "14px", fontWeight: "bold" }}>{fmt$(r.monthlyPay)}</td>
                      <td style={{ ...styles.td, color: "#80c080" }}>{fmt$(r.monthlyPay * 12)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BREAKDOWN PANEL */}
      {selectedRow != null && sel && activeTab === "table" && (
        <div style={{ ...styles.section, border: "1px solid #c8a84b" }}>
          <button style={styles.closeBtn} onClick={() => setSelectedRow(null)}>✕ Close</button>
          <div style={styles.sectionTitle}>
            Detailed Calculation — {new Date(sel.retDateStr).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              Active Duty Service (months → years)
              <div style={styles.breakdownCite}>10 U.S.C. § 1405(a)(1)–(a)(2); § 1405(b) (each full month = 1/12 yr)</div>
            </div>
            <div style={styles.breakdownVal}>{sel.adMonths} mo → {fmtYrs(sel.adYears)}</div>
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              Qualifies for IAD § 1405(a)(3) Credit? (requires ≥ 20 AD yrs)
              <div style={styles.breakdownCite}>10 U.S.C. § 1405(a)(3); 10 U.S.C. § 12733; National Guard Bureau retirement guidance</div>
            </div>
            <div style={{ ...styles.breakdownVal, color: sel.qualifiesFor1405 ? "#80c080" : "#c04040" }}>
              {sel.qualifiesFor1405 ? "YES" : "NO — must reach 20 AD years first"}
            </div>
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              IAD Points → § 1405 Service Years ({iadPoints} pts ÷ 360)
              <div style={styles.breakdownCite}>10 U.S.C. § 1405(a)(3); 10 U.S.C. § 12733 (reserve point → service credit conversion)</div>
            </div>
            <div style={styles.breakdownVal}>
              {sel.qualifiesFor1405 ? `${iadPoints} ÷ 360 = ${fmtYrs(sel.iadYears)}` : "—"}
            </div>
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              Total § 1405 Years (AD + IAD) used for Multiplier
              <div style={styles.breakdownCite}>10 U.S.C. § 1405(a) — aggregate of (a)(1) + (a)(2) + (a)(3)</div>
            </div>
            <div style={styles.breakdownVal}>{fmtYrs(sel.total1405Years)} ({sel.total1405Years.toFixed(4)} yrs)</div>
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              Retired Pay Multiplier ({retSys === "BRS" ? "2.0%" : "2.5%"} × § 1405 yrs)
              <div style={styles.breakdownCite}>10 U.S.C. § 1409(b)({retSys === "BRS" ? "2" : "1"}); max {retSys === "BRS" ? "60%" : "75%"} at 30 yrs</div>
            </div>
            <div style={styles.breakdownVal}>
              {retSys === "BRS" ? "2.0%" : "2.5%"} × {sel.total1405Years.toFixed(4)} = {fmtPct(sel.multiplier)}
            </div>
          </div>

          <div style={styles.breakdownRow}>
            <div style={styles.breakdownLabel}>
              Retired Pay Base ({retSys === "FINAL_PAY" ? "Final Month Basic Pay" : "High-36 Average"})
              <div style={styles.breakdownCite}>
                {retSys === "FINAL_PAY"
                  ? "10 U.S.C. § 1406(c) — last month's basic pay"
                  : "10 U.S.C. § 1407 — average of 36 months of basic pay ending at retirement"}
              </div>
            </div>
            <div style={styles.breakdownVal}>{fmt$(sel.retiredPayBase)}/mo</div>
          </div>

          <div style={{ ...styles.breakdownRow, borderBottom: "none" }}>
            <div style={styles.breakdownLabel}>
              Gross Monthly Retirement Pay (Pay Base × Multiplier)
              <div style={styles.breakdownCite}>10 U.S.C. § 1401 (formula); {SYSTEM_AUTHORITIES[retSys]}</div>
            </div>
            <div style={{ ...styles.breakdownVal, color: "#f0c040", fontSize: "20px" }}>
              {fmt$(sel.monthlyPay)}/mo &nbsp; ({fmt$(sel.monthlyPay * 12)}/yr)
            </div>
          </div>

          {sel.high3Months.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ ...styles.sectionTitle, fontSize: "10px" }}>
                High-36 Monthly Breakdown (36 months of basic pay) — Authority: 10 U.S.C. § 1407
              </div>
              <div style={{ overflowX: "auto", maxHeight: "200px", overflow: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.thLeft}>Month</th>
                      <th style={styles.th}>Pay Table</th>
                      <th style={styles.th}>Grade</th>
                      <th style={styles.th}>Pay YOS</th>
                      <th style={styles.th}>Basic Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sel.high3Months.map((m, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#0f1622" : "#111827" }}>
                        <td style={styles.tdLeft}>{m.date}</td>
                        <td style={{ ...styles.td, color: m.projected ? "#40c080" : m.tableYear < PAY_TABLE_YEAR ? "#c8a84b" : "#4a9080", fontSize: "10px" }}>
                          {m.projected
                            ? `${PAY_TABLE_YEAR}+${m.yearsAhead}yr ▲${annualRaiseRate}%`
                            : `${m.tableYear} DFAS ${m.tableYear < PAY_TABLE_YEAR ? "✓" : ""}`}
                        </td>
                        <td style={{ ...styles.td, color: "#c8a84b" }}>{m.grade}</td>
                        <td style={styles.td}>{m.yos}</td>
                        <td style={{ ...styles.td, color: m.projected ? "#40c080" : undefined }}>{fmt$(m.pay)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: "#1a2a0a" }}>
                      <td style={{ ...styles.tdLeft, fontWeight: "bold", color: "#f0c040" }} colSpan={4}>36-Month Average (High-3 Base)</td>
                      <td style={{ ...styles.td, fontWeight: "bold", color: "#f0c040" }}>{fmt$(sel.retiredPayBase)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CHART */}
      {activeTab === "chart" && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Monthly Retirement Pay — 60-Month Projection</div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
              <CartesianGrid stroke="#1e2d45" strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: "#4a6080", fontSize: 10 }} tickLine={false} interval={5} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: "#4a6080", fontSize: 10 }} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: "#0d1520", border: "1px solid #c8a84b", fontFamily: "monospace", fontSize: "12px" }}
                labelStyle={{ color: "#c8a84b" }}
                formatter={(val, name) => name === "pay" ? [fmt$(val), "Monthly Pay"] : [val + "%", "Multiplier"]}
              />
              <Line type="monotone" dataKey="pay" stroke="#f0c040" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p style={{ ...styles.cite, textAlign: "center", marginTop: 8 }}>
            Projection uses {PAY_TABLE_YEAR} pay table for all months. Update pay table annually from DFAS for accuracy.
            Future pay raises will increase actual retirement pay.
          </p>
        </div>
      )}

      {/* REGULATORY REFERENCES */}
      {activeTab === "refs" && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Regulatory Authority Reference Sheet</div>
          {[
            {
              cite: "10 U.S.C. § 1405 — Years of Service",
              text: "Governs computation of years of service for the retirement pay multiplier. Subsection (a)(1)–(a)(2) credits active duty service. Subsection (a)(3) credits additional years under § 12733 (reserve points) as if the member were entitled to pay under § 12731. Subsection (b) provides that each full month beyond whole years counts as 1/12 of a year.",
            },
            {
              cite: "10 U.S.C. § 12733 — Computation of Retired Pay: Years of Service (Reserve)",
              text: "Governs conversion of retirement points (including IDT/IAD, membership, and active duty points) into years of service. Referenced by § 1405(a)(3) to bring IAD points into the active duty retirement multiplier calculation.",
            },
            {
              cite: "10 U.S.C. § 12731 — Age and Service Requirements (Reserve Retirement)",
              text: "Referenced as the conditional anchor in § 1405(a)(3). The statute provides § 12733 credit 'as if' the member were entitled to Reserve retired pay — a legal fiction allowing IAD point credit without the member being a Reserve retiree.",
            },
            {
              cite: "10 U.S.C. § 1407 — High-36 Retired Pay Base",
              text: "For members who first became members after Sep 7, 1980 (and not under BRS), the retired pay base is the monthly average of basic pay for the highest 36 months. In practice this is the 36 months immediately preceding retirement for members at peak pay.",
            },
            {
              cite: "10 U.S.C. § 1406(c) — Final Pay Retired Pay Base",
              text: "For members who first became members before Sep 8, 1980, the retired pay base is the monthly basic pay of the member's retired grade on the day before retirement.",
            },
            {
              cite: "10 U.S.C. § 1409 — Retired Pay Multiplier",
              text: "§ 1409(b)(1): 2.5% per year of service credited under § 1405 for Final Pay and High-3 members. § 1409(b)(2): 2.0% per year for BRS members (amended by FY2016 NDAA). Maximum 75% (non-BRS) or 60% (BRS) reached at 30 years.",
            },
            {
              cite: "37 U.S.C. § 203 — Basic Pay",
              text: "Establishes entitlement to basic pay for active duty members. Monthly basic pay is determined by pay grade and years of service as set forth in the pay tables promulgated by the Secretary of Defense.",
            },
            {
              cite: "37 U.S.C. § 205 — Basic Pay: Years of Service",
              text: "Defines 'years of service' for basic pay computation purposes, using date of initial entry into the military (PEBD/DIEMS).",
            },
            {
              cite: "37 U.S.C. § 1009 — Adjustments of Monthly Basic Pay",
              text: "Establishes the annual pay raise mechanism tied to the Employment Cost Index (ECI). The 2026 raise of 3.8% was set per this statute based on the Oct 31, 2024 BLS ECI release and confirmed by the FY2026 NDAA.",
            },
          ].map(({ cite, text }) => (
            <div key={cite} style={{ borderBottom: "1px solid #1e2d45", paddingBottom: "12px", marginBottom: "12px" }}>
              <div style={{ color: "#c8a84b", fontSize: "12px", fontWeight: "bold", marginBottom: "4px" }}>{cite}</div>
              <div style={{ color: "#8090a0", fontSize: "11px", lineHeight: "1.6" }}>{text}</div>
            </div>
          ))}
        </div>
      )}

      {/* UPDATE INSTRUCTIONS */}
      {activeTab === "update" && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>How to Update the Pay Table Each Year</div>
          <div style={{ color: "#8090a0", lineHeight: "1.8", fontSize: "12px" }}>
            <p style={{ color: "#c8a84b", marginBottom: "8px" }}>Official Source: <span style={{ color: "#e0e8f0" }}>https://www.dfas.mil/MilitaryMembers/payentitlements/Pay-Tables/</span></p>

            <p>The pay table in this calculator is a JavaScript object (<code style={{ color: "#c8a84b" }}>BASIC_PAY</code>) at the top of the source file. Each January, follow these steps:</p>

            <ol style={{ paddingLeft: "20px" }}>
              <li style={{ marginBottom: "8px" }}>Go to the DFAS pay tables URL above and locate the new year's <strong>Active Duty Basic Pay</strong> table.</li>
              <li style={{ marginBottom: "8px" }}>Update <code style={{ color: "#c8a84b" }}>PAY_TABLE_YEAR</code> to the new year (e.g., <code>2027</code>).</li>
              <li style={{ marginBottom: "8px" }}>For each grade (E-1 through E-9, W-1 through W-5, O-1 through O-10), replace the array values. The array order matches these YOS columns: <code style={{ color: "#c8a84b" }}>&lt;2, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 30, 34, 38, 40+</code></li>
              <li style={{ marginBottom: "8px" }}>Use <code>null</code> for cells where a grade is not authorized at that YOS (e.g., E-8 below ~8 years).</li>
              <li style={{ marginBottom: "8px" }}>Save and reload the calculator. All projections will update automatically.</li>
            </ol>

            <div style={{ background: "#0d1520", border: "1px solid #2a3a50", borderRadius: "3px", padding: "12px", marginTop: "12px", fontSize: "11px", color: "#7a8a9e" }}>
              <div style={{ color: "#c8a84b", marginBottom: "6px" }}>Example — updating E-7 for a hypothetical 2027 table:</div>
              <code style={{ color: "#80c080" }}>
                {"// Old (2026):"}<br/>
                {'  "E-7": [3932,4291,4456,4673,4844,5135,5300,5592,5835,6001,6177,6245,6475,6598,7067,7067,7067,7067,7067],'}<br/><br/>
                {"// New (2027, hypothetical 3.5% raise):"}<br/>
                {'  "E-7": [4069,4441,4612,4837,5013,5315,5486,5788,6039,6211,6393,6464,6702,6829,7314,7314,7314,7314,7314],'}
              </code>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", color: "#2a4060", fontSize: "10px", marginTop: "16px" }}>
        For official pay disputes after retirement, cite DFAS.mil pay tables and 10 U.S.C. §§ 1405, 1407, 1409.
        This calculator is a reference tool — verify all figures with your finance office and retirement services officer.
      </div>
    </div>
  );
}
