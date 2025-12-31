import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trophy, Award, Star, Zap, Target, Crown } from "lucide-react"

const contributorLevels = [
  {
    level: 1,
    name: "Explorer",
    icon: Star,
    minContributions: 0,
    maxContributions: 10,
    color: "text-gray-500",
    users: 5420,
    benefits: ["Basic profile badge", "Can write reviews"],
  },
  {
    level: 2,
    name: "Traveler",
    icon: Target,
    minContributions: 11,
    maxContributions: 50,
    color: "text-blue-500",
    users: 1890,
    benefits: ["Enhanced profile badge", "Priority review visibility", "Can add photos"],
  },
  {
    level: 3,
    name: "Adventurer",
    icon: Zap,
    minContributions: 51,
    maxContributions: 150,
    color: "text-green-500",
    users: 520,
    benefits: ["Gold profile badge", "Featured contributor status", "Early access to new features"],
  },
  {
    level: 4,
    name: "Expert",
    icon: Award,
    minContributions: 151,
    maxContributions: 300,
    color: "text-purple-500",
    users: 180,
    benefits: ["Platinum badge", "Can become a local guide", "Exclusive rewards program"],
  },
  {
    level: 5,
    name: "Legend",
    icon: Crown,
    minContributions: 301,
    maxContributions: 999999,
    color: "text-yellow-500",
    users: 42,
    benefits: ["Diamond badge", "VIP support", "Collaborate with businesses", "Annual recognition"],
  },
]

const badges = [
  {
    name: "Top Reviewer",
    description: "Awarded to users with 100+ helpful reviews",
    icon: Trophy,
    enabled: true,
    holders: 234,
  },
  {
    name: "Photo Contributor",
    description: "Awarded to users who shared 50+ photos",
    icon: Star,
    enabled: true,
    holders: 567,
  },
  {
    name: "Local Guide",
    description: "Verified local experts in specific regions",
    icon: Award,
    enabled: true,
    holders: 89,
  },
  {
    name: "Early Adopter",
    description: "First 1000 users on the platform",
    icon: Zap,
    enabled: false,
    holders: 1000,
  },
]

const rewardSettings = [
  {
    id: "points-per-review",
    label: "Points per Review",
    description: "Points awarded for each published review",
    value: "10",
    enabled: true,
  },
  {
    id: "points-per-photo",
    label: "Points per Photo",
    description: "Points awarded for each uploaded photo",
    value: "5",
    enabled: true,
  },
  {
    id: "bonus-helpful-review",
    label: "Helpful Review Bonus",
    description: "Bonus points when review is marked helpful",
    value: "2",
    enabled: true,
  },
  {
    id: "streak-bonus",
    label: "Streak Bonus",
    description: "Enable daily contribution streak rewards",
    value: "",
    enabled: false,
  },
]

export default function GamificationPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gamification Management</h1>
        <p className="text-muted-foreground">
          Configure contributor levels, badges, and reward systems.
        </p>
      </div>

      {/* Contributor Levels */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Contributor Levels</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contributorLevels.map((level) => (
            <Card key={level.level}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg bg-accent p-2 ${level.color}`}>
                    <level.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Level {level.level}: {level.name}
                    </CardTitle>
                    <CardDescription>
                      {level.minContributions} –{" "}
                      {level.maxContributions === 999999 ? "∞" : level.maxContributions} contributions
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                  <div className="text-2xl font-bold">
                    {level.users.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">Benefits</div>
                  <ul className="space-y-1">
                    {level.benefits.map((benefit, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  Edit Level
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Badges & Achievements */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Badges & Achievements</h2>

        <div className="grid gap-4 md:grid-cols-2">
          {badges.map((badge) => (
            <Card key={badge.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent p-2">
                      <badge.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{badge.name}</CardTitle>
                      <CardDescription>{badge.description}</CardDescription>
                    </div>
                  </div>
                  <Switch checked={badge.enabled} />
                </div>
              </CardHeader>

              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Badge Holders</div>
                  <div className="text-xl font-bold">
                    {badge.holders.toLocaleString()}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit Badge
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reward System */}
      <Card>
        <CardHeader>
          <CardTitle>Reward System Settings</CardTitle>
          <CardDescription>
            Configure how users earn points and rewards
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {rewardSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between border-b pb-4 last:border-0"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Label htmlFor={setting.id}>{setting.label}</Label>
                  <Switch id={setting.id} checked={setting.enabled} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {setting.description}
                </p>
              </div>

              {setting.value && (
                <div className="flex items-center gap-2">
                  <Input type="number" value={setting.value} className="w-24" />
                  <span className="text-sm text-muted-foreground">points</span>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-2">
            <Button variant="outline">Reset to Default</Button>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
