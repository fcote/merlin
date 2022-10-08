package domain

import (
	"fmt"

	"github.com/fcote/merlin/sheduler/pkg/pointer"
	"github.com/fcote/merlin/sheduler/pkg/slices"
)

type NewsType string

const (
	NewsTypeStandard     NewsType = "standard"
	NewsTypePressRelease NewsType = "press-release"
)

func (n NewsType) String() string {
	return string(n)
}

type NewsBase struct {
	Date    string
	Type    NewsType
	Title   string
	Content string
	Website string
	Url     string
	Ticker  string
}

type News struct {
	NewsBase
	SecurityId int
}

func NewsFromBase(base NewsBase, securityId int) News {
	return News{
		NewsBase:   base,
		SecurityId: securityId,
	}
}

func (n News) Hash() string {
	return fmt.Sprintf(
		"%d-%s-%s",
		n.SecurityId,
		n.Type.String(),
		n.Title,
	)
}

func (n News) Equal(comp News) bool {
	return n.SecurityId == comp.SecurityId &&
		n.Type == comp.Type &&
		n.Title == comp.Title
}

type Newses []News

func (newses Newses) Dates() []string {
	return slices.Map(newses, func(n News) string {
		return n.Date
	})
}

func (newses Newses) Types() []string {
	return slices.Map(newses, func(n News) string {
		return n.Type.String()
	})
}

func (newses Newses) Titles() []string {
	return slices.Map(newses, func(n News) string {
		return n.Title
	})
}

func (newses Newses) Contents() []string {
	return slices.Map(newses, func(n News) string {
		return n.Content
	})
}

func (newses Newses) Websites() []*string {
	return slices.Map(newses, func(n News) *string {
		if n.Website == "" {
			return nil
		}
		return pointer.To(n.Website)
	})
}

func (newses Newses) Urls() []*string {
	return slices.Map(newses, func(n News) *string {
		if n.Url == "" {
			return nil
		}
		return pointer.To(n.Url)
	})
}

func (newses Newses) SecurityIds() []int {
	return slices.Map(newses, func(n News) int {
		return n.SecurityId
	})
}

func (newses Newses) Unique() Newses {
	return slices.Unique(newses)
}

func (newses Newses) IdsFromUniques(uniques Newses, uniqueIds []int) []int {
	ids := make([]int, len(newses))
	for i, earning := range newses {
		pos := slices.FindIndex(uniques, earning)
		ids[i] = uniqueIds[pos]
	}
	return ids
}
