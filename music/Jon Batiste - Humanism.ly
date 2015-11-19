\version "2.16.2"

melody = {
  g16 a c r a r c r a r c r a r c d e e r2 r4 r8 g,16 a c r a r c r a r c r a r c d e d r2 r4 r8
  g,16 a c r a r c r a r c r a r c d g e r2 r4 r8 g,16 a c r a r c r a r c r a r c d e d~ d4 r8 c16 b~ b8 r4
  e8 g r a r c r r4 r8 e,16 r d16 r c d r d8 c16 d r c r r8 e16 r d16 r c d r d8 c16 d r c r r8 d16 r d r c r d'8 r d
  r c a16 r r8 a~ a c, d e r e16 r d r c d r d8 c16 d r e r
}

tag = {
  a4 g8 r e d c d~ d e~ e c~ c a g a16 r
}

high = {
  r8 g r g r g r g r fis r fis r fis r fis r a r a r a r a r g r g r g r g
}

low = {
  r8 c r c r c r c r c r c r c r c r c r c r c r c r b r b r b r b
}

bass = {
  r8 a8 r4 a8 r4 e'8 dis d r4 d8 r4 d8 e f r4 f,8 r4 f8 fis g r4 g8 g r g
}

\score {
  <<
    \partial 8
    \new Staff \with {
      instrumentName = #"Melody"
    }
    \relative c'' {
      \melody \tag
    }

    \new Staff \with {
      instrumentName = #"Inner high"
    }
    \relative c'' {
      \high \high \high
      r8 g r g r g r g r fis r fis r fis r fis r \tag
    }

    \new Staff \with {
      instrumentName = #"Inner low"
    }
    \relative c' {
      \low \low \low
      r8 c r c r c r c r c r c r c r c r \tag
    }

    \new Staff \with {
      instrumentName = #"Bass"
    }
    \relative c {
      \clef bass
      \bass \bass \bass
      r8 a8 r4 a8 r4 e'8 dis d r4 d8 r4 d8 r \tag
    }
  >>

  \layout {}
  \midi {
    \context {
      \Score
      tempoWholesPerMinute = #(ly:make-moment 114 4)
    }
  }
}
