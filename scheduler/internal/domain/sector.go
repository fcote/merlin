package domain

import "github.com/fcote/merlin/sheduler/pkg/slices"

type Sector struct {
	Name string
}

func SectorFromString(name string) Sector {
	return Sector{
		Name: name,
	}
}

func (s Sector) Hash() string {
	return s.Name
}

func (s Sector) Equal(comp Sector) bool {
	return s.Name == comp.Name
}

type Sectors []Sector

func (sectors Sectors) Names() []string {
	return slices.Map(sectors, func(s Sector) string {
		return s.Name
	})
}

func (sectors Sectors) Unique() Sectors {
	return slices.Unique(sectors)
}

func (sectors Sectors) IdsFromUniques(uniques Sectors, uniqueIds []int) []int {
	ids := make([]int, len(sectors))
	for i, sector := range sectors {
		pos := slices.FindIndex(uniques, sector)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
