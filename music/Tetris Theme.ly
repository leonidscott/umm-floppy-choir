\version "2.16.2"

\score {
  <<
    \partial 4

    \new Staff \relative c'' {
      e4 e b8 c d4 c8 b a4 a8 c e4 d8 c b4 b8 c d4 e c a a r
      d4. f8 a4 g8 f e4. c8 e4 d8 c b4 b8 c d4 e c a a r
      e'2 c d b c a gis b e c d b c4 e a a gis1
    }

    \new Staff \relative c'' {
      e4 e b8 c d4 c8 b a4 a8 c e4 d8 c b4 b8 c d4 e c a a r
      d4. f8 a4 g8 f e4. c8 e4 d8 c b4 b8 c d4 e c a a r
      e'2 c d b c a gis b e c d b c4 e a a gis1
    }

    \new Staff \relative c'' {
      b4 b gis8 a b4 a8 gis e4 e8 a c4 b8 a gis4 gis8 a b4 c a e e r
      f4. a8 c4 b8 a g4. e8 g4 f8 e gis4 gis8 a b4 c a e e r
      c'2 a b gis a a gis b c a b gis a4 c e e e1
    }

    \new Staff \relative c'' {
      b4 b gis8 a b4 a8 gis e4 e8 a c4 b8 a gis4 gis8 a b4 c a e e r
      f4. a8 c4 b8 a g4. e8 g4 f8 e gis4 gis8 a b4 c a e e r
      c'2 a b gis a a gis b c a b gis a4 c e e e1
    }

    \new Staff \relative c'' {
      r4 r8 e r e r e r e r a, r a r a r a r gis r gis r gis r gis r a r a a b c d
      r d r d r d r d r c r c r c r c r d r d r d r d r a r a r a r a
      r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e r e
    }

    \new Staff \relative c' {
      \clef bass
      r4 e8 r e r e r e r a, r a r a r a r gis r gis r gis r gis r a r a r a b c d
      d r d r d r d r c r c r c r c r d r d r d r d r a r a r a r a r
      a r a r a r a r gis r gis r gis r gis r a r a r a r a r gis r gis r gis r gis r a r a r a r a r gis r gis r gis r gis r a r a r a r a r gis r gis r gis r gis r
    }
  >>

  \layout {}
  \midi {
    \context {
      \Score
      tempoWholesPerMinute = #(ly:make-moment 138 4)
    }
  }
}

