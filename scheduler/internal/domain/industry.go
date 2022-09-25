package domain

import "github.com/fcote/merlin/sheduler/pkg/slices"

type Industry struct {
	Name string
}

func IndustryFromString(name string) Industry {
	return Industry{
		Name: name,
	}
}

func (i Industry) Hash() string {
	return i.Name
}

func (i Industry) Equal(comp Industry) bool {
	return i.Name == comp.Name
}

type Industries []Industry

func (industries Industries) Names() []string {
	return slices.Map(industries, func(i Industry) string {
		return i.Name
	})
}

func (industries Industries) Unique() Industries {
	return slices.Unique(industries)
}

func (industries Industries) IdsFromUniques(uniques Industries, uniqueIds []int) []int {
	ids := make([]int, len(industries))
	for i, industry := range industries {
		pos := slices.FindIndex(uniques, industry)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
