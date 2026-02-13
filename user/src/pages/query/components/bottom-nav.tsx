import { Text, View } from '@tarojs/components'

interface BottomNavProps {
  tabs: readonly string[]
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabClassName = (active: boolean) => (active ? 'query-bottom-tab is-active' : 'query-bottom-tab')

export default function BottomNav({ tabs, activeTab, onTabChange }: BottomNavProps) {
  return (
    <View className='query-bottom-nav'>
      <View className='query-bottom-nav-grid'>
        {tabs.map((tab) => {
          const active = tab === activeTab

          return (
            <View key={tab} className={tabClassName(active)} onClick={() => onTabChange(tab)}>
              <Text className='query-bottom-tab-text'>{tab}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
