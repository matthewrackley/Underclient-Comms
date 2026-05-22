import styled from "styled-components";

interface CrossChannelTabsProps {
  tabs: string[];
  activeIndex: number;
}

const Tabs = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.space.xs};
  background: ${({ theme }) => theme.color.surfaceAlt};
  padding: 4px;
  border-radius: ${({ theme }) => theme.radius.pill};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

const Tab = styled.div<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: 12px;
  color: ${({ $active, theme }) => ($active ? "#120b07" : theme.color.textMuted)};
  background: ${({ $active, theme }) => ($active ? theme.color.accent : "transparent")};
`;

export const CrossChannelTabs = ({ tabs, activeIndex }: CrossChannelTabsProps) => (
  <Tabs>
    {tabs.map((tab, index) => (
      <Tab key={tab} $active={index === activeIndex}>
        {tab}
      </Tab>
    ))}
  </Tabs>
);
