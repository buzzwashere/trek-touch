export type Department = 'command' | 'engineering' | 'science' | 'operations' | 'medical' | 'tactical'

export interface DepartmentInfo {
  id: Department
  label: string
  short: string
  color: string
  code: string
}

export interface Ribbon {
  id: string
  code: string
  department: Department
  title: string
  summary: string
  detail: string
  // The ribbon's headline readout, and the unit it is shown in.
  value: number
  unit: string
  // Where the readout sits between 0 and 1 on its meter.
  level: number
}

export const DEPARTMENTS: DepartmentInfo[] = [
  { id: 'command', label: 'Command', short: 'CMD', color: 'var(--lc-periwinkle)', code: '01-1701' },
  { id: 'engineering', label: 'Engineering', short: 'ENG', color: 'var(--lc-gold)', code: '02-7465' },
  { id: 'science', label: 'Science', short: 'SCI', color: 'var(--lc-ice)', code: '03-4409' },
  { id: 'operations', label: 'Operations', short: 'OPS', color: 'var(--lc-peach)', code: '04-2212' },
  { id: 'medical', label: 'Medical', short: 'MED', color: 'var(--lc-lilac)', code: '05-0086' },
  { id: 'tactical', label: 'Tactical', short: 'TAC', color: 'var(--lc-orange)', code: '06-3190' },
]

export const RIBBONS: Ribbon[] = [
  {
    id: 'warp-core',
    code: '47-0921',
    department: 'engineering',
    title: 'Warp Core Integrity',
    summary: 'Dilithium matrix aligned. Injector 3 phase variance compensating.',
    detail:
      'Matter/antimatter reaction assembly holding at warp 6 sustainable. Plasma injector three ' +
      'shows a 0.02 millicochrane phase drift; automatic compensation engaged. Recommend a ' +
      'manual recalibration at the next scheduled maintenance cycle — or sooner, if the Chief ' +
      'Engineer says so, which she will.',
    value: 98.4,
    unit: '%',
    level: 0.98,
  },
  {
    id: 'astrometrics',
    code: '31-5578',
    department: 'science',
    title: 'Astrometrics',
    summary: 'Long-range sweep of the expanse complete. 12 Class-M candidates.',
    detail:
      'Stellar cartography reconciled against the updated sensor lattice. Twelve Class-M ' +
      'candidates catalogued within 40 light-years; three flagged for dilithium signatures and ' +
      'one for an unusually cheerful thermal profile. Shortcut probability through the nebula: ' +
      'low but not zero, which on this ship counts as a plan.',
    value: 12,
    unit: 'M-CLASS',
    level: 0.6,
  },
  {
    id: 'deflector',
    code: '06-1142',
    department: 'tactical',
    title: 'Deflector Grid',
    summary: 'Shield harmonics cycling at 257.4 THz. Forward grid 91%.',
    detail:
      'Shield frequency rotating on a randomised 36-step cycle to frustrate adaptive weapons. ' +
      'Forward grid at 91%, aft at 88%. Ventral emitter 4 reports micrometeoroid pitting; ' +
      'a repair team is suited up and mildly resentful about it.',
    value: 91,
    unit: '%',
    level: 0.91,
  },
  {
    id: 'gel-packs',
    code: '22-0014',
    department: 'engineering',
    title: 'Bio-Neural Gel Packs',
    summary: 'Pack 14-Delta running warm. Cheese contamination ruled out.',
    detail:
      'Gel pack 14-Delta is 1.3 degrees above nominal. Bacterial screening negative. Galley ' +
      'cheese stores confirmed sealed and more than 30 metres from any relay junction. The ' +
      'galley has been reminded anyway.',
    value: 37.9,
    unit: '°C',
    level: 0.72,
  },
  {
    id: 'sickbay',
    code: '05-0001',
    department: 'medical',
    title: 'Sickbay',
    summary: 'EMH active. Holo-emitter efficiency 99.1%. Two patients.',
    detail:
      'Emergency Medical Hologram online and reporting, at some length, that it was not ' +
      'designed for long-term use. Current patients: one plasma burn (minor), one ensign who ' +
      'tried the new replicator recipe (moderate). Prognosis: both will live. The recipe will not.',
    value: 99.1,
    unit: '%',
    level: 0.99,
  },
  {
    id: 'hydroponics',
    code: '04-6630',
    department: 'operations',
    title: 'Hydroponics Bay',
    summary: 'Leola root yield 40% over projection. Morale impact: indeterminate.',
    detail:
      'Cargo bay two conversion continues to outperform. Leola root harvest exceeds forecast by ' +
      '40%. Tomato strain K-12 shows promise. Survey of crew attitudes toward leola root ' +
      'postponed indefinitely for reasons of morale.',
    value: 140,
    unit: '%',
    level: 0.84,
  },
  {
    id: 'transporter',
    code: '04-2289',
    department: 'operations',
    title: 'Transporter Room 2',
    summary: 'Pattern buffers purged. Away-team recall beam calibrated.',
    detail:
      'Annular confinement beam calibrated for a four-person recall from the planet surface. ' +
      'Heisenberg compensators within tolerance. Pattern buffer purged and verified — nobody ' +
      'is being stored in there this time.',
    value: 4,
    unit: 'LOCKS',
    level: 0.5,
  },
  {
    id: 'holodeck',
    code: '04-0002',
    department: 'operations',
    title: 'Holodeck 2',
    summary: 'Program running: Irish village, 19th century. Safeties ON.',
    detail:
      'Recreational program in progress; eleven crew and forty-two holographic villagers ' +
      'present. Safety protocols engaged and double-checked. Ration surcharge applies after ' +
      'the first hour. Please do not fall in love with the bartender.',
    value: 53,
    unit: 'OCCUP',
    level: 0.44,
  },
  {
    id: 'contact',
    code: '06-9001',
    department: 'tactical',
    title: 'Sensor Contact',
    summary: 'Unidentified vessel, bearing 142 mark 7. Hails unanswered.',
    detail:
      'Vessel of unknown configuration holding position at 400,000 kilometres. No weapons ' +
      'signature; faint polaron emissions. Hailing on all frequencies without response. ' +
      'Tactical recommends yellow alert. Command recommends patience. Coffee recommends itself.',
    value: 400,
    unit: 'MKM',
    level: 0.3,
  },
  {
    id: 'helm',
    code: '01-7400',
    department: 'command',
    title: 'Helm & Navigation',
    summary: 'Course laid in for home. ETA 70.3 years at current speed.',
    detail:
      'Heading 047 mark 3, warp 6. Estimated time of arrival at the Alpha Quadrant: 70.3 years. ' +
      'Navigation continues to scan for wormholes, transwarp conduits, slipstream corridors, ' +
      'and any other loophole in physics that might knock a few decades off.',
    value: 70.3,
    unit: 'YRS',
    level: 0.06,
  },
  {
    id: 'replicators',
    code: '04-1180',
    department: 'operations',
    title: 'Replicator Rations',
    summary: 'Allowance: 3 per diem. Bridge coffee requests exceed quota.',
    detail:
      'Energy reserves allow three replicator rations per crewmember per day. Requests for ' +
      '"coffee, black" from the bridge exceed the command allocation by a factor of four. ' +
      'Finance has stopped asking where the rations are going.',
    value: 3,
    unit: 'RATIONS',
    level: 0.25,
  },
  {
    id: 'comms',
    code: '03-8812',
    department: 'science',
    title: 'Subspace Relay',
    summary: 'Link to Starfleet via ancient relay network. Signal loss 62%.',
    detail:
      'Monthly data window opens in 06:14:22. Compression ratio raised to fit the crew letters ' +
      'into the burst. Signal degradation 62% across the relay chain. Personal messages ' +
      'prioritised; quarterly reports, regrettably, also prioritised.',
    value: 38,
    unit: '% SIG',
    level: 0.38,
  },
]
