const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const Utils = require("../utils");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queuemanager")
    .setDescription("Advanced queue management with interactive controls"),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);

    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Empty Queue",
            "There are no songs in the queue!"
          ),
        ],
        ephemeral: true,
      });
    }

    if (!interaction.member.voice?.channel) {
      return interaction.reply({
        embeds: [
          Utils.createErrorEmbed(
            "Voice Channel Required",
            "You need to be in a voice channel!"
          ),
        ],
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(config.colors.primary)
      .setTitle(`${config.emojis.queue} Queue Manager`)
      .setDescription(
        `**Currently Playing:**\n${
          queue.songs[0]
            ? `[${queue.songs[0].name}](${queue.songs[0].url})`
            : "Nothing"
        }`
      )
      .addFields(
        {
          name: "Queue Length",
          value: `${queue.tracks.size} tracks`,
          inline: true,
        },
        {
          name: "Total Duration",
          value: Utils.getTotalQueueDuration(queue),
          inline: true,
        },
        {
          name: "Loop Mode",
          value: queue.repeatMode ? "Enabled" : "Disabled",
          inline: true,
        },
        { name: "Volume", value: `${queue.node.volume}%`, inline: true },
        {
          name: "Paused",
          value: queue.node.isPaused() ? "Yes" : "No",
          inline: true,
        },
        {
          name: "Autoplay",
          value: queue.repeatMode === 3 ? "Yes" : "No",
          inline: true,
        }
      )
      .setTimestamp();

    // Create control buttons
    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("queue_shuffle")
        .setLabel("Shuffle")
        .setEmoji("🔀")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("queue_clear")
        .setLabel("Clear")
        .setEmoji("🗑️")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("queue_reverse")
        .setLabel("Reverse")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("queue_skip_duplicates")
        .setLabel("Remove Duplicates")
        .setEmoji("🔍")
        .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("queue_view")
        .setLabel("View Queue")
        .setEmoji("📋")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("queue_save")
        .setLabel("Save Playlist")
        .setEmoji("💾")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("queue_close")
        .setLabel("Close")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary)
    );

    const response = await interaction.reply({
      embeds: [embed],
      components: [row1, row2],
    });

    // Create collector for button interactions
    const filter = (i) => i.user.id === interaction.user.id;
    const collector = response.createMessageComponentCollector({
      filter,
      time: 300000,
    }); // 5 minutes

    collector.on("collect", async (buttonInteraction) => {
      await buttonInteraction.deferUpdate();

      try {
        switch (buttonInteraction.customId) {
          case "queue_shuffle":
            if (queue.tracks.size === 0) {
              await buttonInteraction.followUp({
                embeds: [
                  Utils.createErrorEmbed(
                    "Empty Queue",
                    "No tracks to shuffle!"
                  ),
                ],
                ephemeral: true,
              });
              return;
            }
            queue.tracks.shuffle();
            await buttonInteraction.followUp({
              embeds: [
                Utils.createSuccessEmbed(
                  "Queue Shuffled",
                  `Shuffled ${queue.tracks.size} tracks!`
                ),
              ],
              ephemeral: true,
            });
            break;

          case "queue_clear":
            if (queue.tracks.size === 0) {
              await buttonInteraction.followUp({
                embeds: [
                  Utils.createErrorEmbed(
                    "Empty Queue",
                    "Queue is already empty!"
                  ),
                ],
                ephemeral: true,
              });
              return;
            }
            const clearedCount = queue.tracks.size;
            queue.tracks.clear();
            await buttonInteraction.followUp({
              embeds: [
                Utils.createSuccessEmbed(
                  "Queue Cleared",
                  `Removed ${clearedCount} tracks from queue!`
                ),
              ],
              ephemeral: true,
            });
            break;

          case "queue_reverse":
            if (queue.tracks.size < 2) {
              await buttonInteraction.followUp({
                embeds: [
                  Utils.createErrorEmbed(
                    "Not Enough Tracks",
                    "Need at least 2 tracks to reverse!"
                  ),
                ],
                ephemeral: true,
              });
              return;
            }
            const tracks = queue.tracks.toArray().reverse();
            queue.tracks.clear();
            tracks.forEach((track) => queue.tracks.add(track));
            await buttonInteraction.followUp({
              embeds: [
                Utils.createSuccessEmbed(
                  "Queue Reversed",
                  `Reversed ${tracks.length} tracks!`
                ),
              ],
              ephemeral: true,
            });
            break;

          case "queue_skip_duplicates":
            const originalSize = queue.tracks.size;
            const uniqueTracks = [];
            const seenTracks = new Set();

            queue.tracks.toArray().forEach((track) => {
              const trackId = `${track.title}-${track.author}`;
              if (!seenTracks.has(trackId)) {
                seenTracks.add(trackId);
                uniqueTracks.push(track);
              }
            });

            queue.tracks.clear();
            uniqueTracks.forEach((track) => queue.tracks.add(track));

            const removedCount = originalSize - uniqueTracks.length;
            await buttonInteraction.followUp({
              embeds: [
                Utils.createSuccessEmbed(
                  "Duplicates Removed",
                  `Removed ${removedCount} duplicate tracks! Queue now has ${uniqueTracks.length} unique tracks.`
                ),
              ],
              ephemeral: true,
            });
            break;

          case "queue_view":
            const queueEmbed = Utils.createQueueEmbed(queue, 1, 10);
            await buttonInteraction.followUp({
              embeds: [queueEmbed],
              ephemeral: true,
            });
            break;

          case "queue_save":
            // This would typically save to a database, for now just show info
            const saveEmbed = Utils.createInfoEmbed(
              "Playlist Save",
              "Playlist saving feature is coming soon! This will allow you to save your current queue as a custom playlist."
            );
            await buttonInteraction.followUp({
              embeds: [saveEmbed],
              ephemeral: true,
            });
            break;

          case "queue_close":
            await buttonInteraction.editReply({ components: [] });
            collector.stop();
            break;
        }

        // Update the main embed with current stats
        const updatedEmbed = new EmbedBuilder()
          .setColor(config.colors.primary)
          .setTitle(`${config.emojis.queue} Queue Manager`)
          .setDescription(
            `**Currently Playing:**\n${
              queue.currentTrack
                ? `[${queue.currentTrack.title}](${queue.currentTrack.url})`
                : "Nothing"
            }`
          )
          .addFields(
            {
              name: "Queue Length",
              value: `${queue.tracks.size} tracks`,
              inline: true,
            },
            {
              name: "Total Duration",
              value: Utils.getTotalQueueDuration(queue),
              inline: true,
            },
            {
              name: "Loop Mode",
              value: queue.repeatMode ? "Enabled" : "Disabled",
              inline: true,
            },
            { name: "Volume", value: `${queue.node.volume}%`, inline: true },
            {
              name: "Paused",
              value: queue.node.isPaused() ? "Yes" : "No",
              inline: true,
            },
            {
              name: "Autoplay",
              value: queue.repeatMode === 3 ? "Yes" : "No",
              inline: true,
            }
          )
          .setTimestamp();

        if (buttonInteraction.customId !== "queue_close") {
          await buttonInteraction.editReply({ embeds: [updatedEmbed] });
        }
      } catch (error) {
        console.error("Queue manager error:", error);
        await buttonInteraction.followUp({
          embeds: [
            Utils.createErrorEmbed(
              "Action Failed",
              "Failed to perform the requested action."
            ),
          ],
          ephemeral: true,
        });
      }
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (error) {
        // Message might have been deleted
      }
    });
  },

  cooldown: 5,
};
