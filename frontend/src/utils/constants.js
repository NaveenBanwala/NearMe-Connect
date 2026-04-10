// ── Request types — expanded ──────────────────────────────────────────────────
export const REQUEST_TYPES = ['help', 'talk', 'play', 'free', 'study', 'food', 'ride', 'lost']

export const REQUEST_TYPE_META = {
  help:  { emoji:'🤝', label:'Help',  color:'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300'   },
  talk:  { emoji:'💬', label:'Talk',  color:'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  play:  { emoji:'🎮', label:'Play',  color:'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300'  },
  free:  { emoji:'☕', label:'Free',  color:'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300'  },
  study: { emoji:'📚', label:'Study', color:'bg-sky-100    text-sky-700    dark:bg-sky-900/40    dark:text-sky-300'    },
  food:  { emoji:'🍕', label:'Food',  color:'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  ride:  { emoji:'🛵', label:'Ride',  color:'bg-rose-100   text-rose-700   dark:bg-rose-900/40   dark:text-rose-300'   },
  lost:  { emoji:'🔍', label:'Lost',  color:'bg-slate-100  text-slate-700  dark:bg-slate-800     dark:text-slate-300'  },
}

// ── Heat ─────────────────────────────────────────────────────────────────────
export const HEAT_LABELS  = ['Cold',  'Mild',  'Warm',     'Hot',    'On Fire']
export const HEAT_EMOJI   = ['❄️',    '🌤️',   '🔥',       '🔥🔥',   '✨🔥']
export const HEAT_COLORS  = [
  'bg-sky-400/90  text-white',
  'bg-amber-400   text-slate-900',
  'bg-orange-500  text-white',
  'bg-red-600     text-white',
  'bg-rose-500    text-white ring-2 ring-rose-300',
]

// ── Map modes ─────────────────────────────────────────────────────────────────
export const MAP_MODES = {
  CAMPUS:          'campus',
  NEARBY_CAMPUSES: 'nearby_campuses',
  RADIUS:          'radius',
}

// ── Visibility ────────────────────────────────────────────────────────────────
export const REQUEST_VISIBILITIES = {
  STUDENTS: 'students_only',
  PUBLIC:   'public',
}

// ── Profile emoji picker ──────────────────────────────────────────────────────
export const PROFILE_EMOJIS = [
  '😊','😎','🤓','🥳','🦁','🐯','🦊','🐼',
  '🐨','🦅','🌟','⚡','🔥','🌈','🎯','🎸',
  '🚀','🌙','🌊','🍀','🎭','🦄','🐉','💎',
]

export const TAB_PATHS = ['/', '/search', '/chats', '/profile']