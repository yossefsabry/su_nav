The default style extension for an MVF. This describes things like the color, height and opacity that should be applied to Geometry.

Not every geometry will have a default style, and if it does not, it should not be rendered.

# MVF Default Style

The default style extension for an MVF. A [DefaultStyle](../types/_mappedin_mvf-default-style.DefaultStyle.html) has things like color, height and opacity and the geometry it should be applied to. It is geared towards rendering the MVF in a 3D mapping engine, but specific properties like color may be useful in other contexts.

If a geometry is NOT referenced by a style, or some other style-like extension, it should generally NOT be rendered by default.

In particular, it is expected that Geometry of [kind](../modules/_mappedin_mvf-kinds.html) area will not get a default style, but there may be other cases.