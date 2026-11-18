/** Local mock — same shape as `retrieve_third_party_skills`. */
export function mockThirdPartySkillsServices() {
  return [
    {
      id: 1,
      name: "維修安裝服務",
      groups: [
        {
          title: "水電・喉管",
          items: [
            { content: "水電維修", is_need_cert: false },
            { content: "更換食水喉", is_need_cert: false },
          ],
        },
        {
          title: "家具・裝修",
          items: [
            { content: "家具安裝", is_need_cert: false },
            { content: "油漆翻新", is_need_cert: false },
            { content: "地板翻新", is_need_cert: false },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "寵物服務",
      groups: [
        {
          title: "你上客人屋企",
          items: [
            { content: "寵物散步", is_need_cert: false },
            { content: "上門照顧", is_need_cert: false },
            { content: "上門過夜照顧", is_need_cert: false },
            { content: "寵物美容（上門）", is_need_cert: false },
          ],
        },
        {
          title: "寵物去你屋",
          items: [{ content: "寄宿服務", is_need_cert: true }],
        },
        {
          title: "可接受寵物體型",
          items: [
            { content: "小型/貓", is_need_cert: false },
            { content: "中型狗", is_need_cert: false },
            { content: "大型狗", is_need_cert: false },
          ],
        },
        {
          title: "寄宿同時最多接幾多",
          items: [
            { content: "一隻", is_need_cert: false },
            { content: "兩隻", is_need_cert: false },
            { content: "三隻+", is_need_cert: false },
          ],
        },
      ],
    },
  ];
}